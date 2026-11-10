// The dashboard's calls to our API: timeouts, safe retries and plain-language errors.

/**
 * Refreshes the session cache cookie through the Neon Auth proxy. True when the session is still
 * valid. Shared so several requests failing at once only check once.
 */
let refreshing = null;
export function refreshSession() {
  refreshing ||= fetch('/api/auth/get-session', { credentials: 'same-origin', cache: 'no-store' })
    .then(async (r) => (r.ok ? !!(await r.json().catch(() => null))?.session : null))
    .catch(() => null)
    .finally(() => setTimeout(() => { refreshing = null; }, 1000));
  return refreshing;
}

/** Answers worth trying again: the server or a proxy was briefly unavailable, or asked us to slow down. */
const TRANSIENT = new Set([429, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One call to our API, made robust:
 * - A timeout, so a request on a dead connection fails instead of hanging the dashboard's saves.
 * - Automatic retries with exponential backoff and jitter (honouring Retry-After) for dropped connections and
 *   brief server errors, but only for requests that are safe to repeat: reads, and writes that set a full state
 *   (PUT/PATCH/DELETE). A POST, and anything with `publish_now`, is never repeated: the first try may have
 *   gone through, and a second could post twice.
 * - Plain-language errors instead of the browser's "Failed to fetch".
 *
 * @param {string} path
 * @param {{ method?: string, body?: any, retry?: boolean, timeoutMs?: number }} [opts]
 * @param {boolean} [retried]
 * @returns {Promise<any>}
 */
export async function api(path, { method = 'GET', body, retry, timeoutMs } = {}, retried = false) {
  const idempotent = method !== 'POST' && !(body && body.publish_now);
  const tries = (retry ?? idempotent) ? 3 : 1;
  // Publishing can take minutes on the server: no timeout there. Everything else answers well within these.
  const limit = timeoutMs ?? (body && body.publish_now ? 0 : method === 'GET' ? 30_000 : 60_000);
  let res, repeated = false;
  for (let attempt = 0; ; attempt++) {
    const ctrl = typeof AbortController === 'function' && limit ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), limit) : 0;
    let netErr = null;
    try {
      res = await fetch(path, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
        signal: ctrl?.signal,
      });
    } catch (e) {
      netErr = e;
    } finally {
      clearTimeout(timer);
    }
    const transient = netErr || TRANSIENT.has(res.status);
    if (!transient || attempt >= tries - 1) {
      if (netErr) {
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
        throw new Error(
          netErr.name === 'AbortError'
            ? 'The server took too long to answer. Check your connection and try again.'
            : offline
              ? "You're offline. Changes are saved again when you reconnect."
              : "Couldn't reach the server. Check your connection and try again.",
        );
      }
      break;
    }
    const ra = Number(res?.headers?.get('retry-after'));
    await sleep(Math.min(8000, ra > 0 ? ra * 1000 : 500 * 3 ** attempt) * (0.75 + Math.random() * 0.5));
    repeated = true;
  }
  // A DELETE whose first try went through but whose answer was lost finds nothing the second time: that's success.
  if (method === 'DELETE' && res.status === 404 && repeated) return {};
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // Only leave for the login page when the session is really gone; a stale cache cookie is
    // refreshed and the request tried again.
    const ok = retried ? false : await refreshSession();
    if (ok) return api(path, { method, body, retry, timeoutMs }, true);
    if (ok === false) {
      window.location.href = '/login?next=/app';
      throw new Error('Signed out');
    }
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    // 402: the Free plan's limit or a paid feature. The dashboard opens the plan picker with the reason.
    if (res.status === 402 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('sfy:upgrade', { detail: { message: err.message } }));
    throw err;
  }
  return data;
}
