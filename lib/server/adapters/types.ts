import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { PlatformId } from '../platforms';

export type SocialAccount = {
  id: string;
  workspace_id: string;
  platform: PlatformId;
  external_id: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: number | null;
  meta: Record<string, any>;
  status: string;
};

export type MediaFile = {
  id: string;
  key: string;       // object key in the media bucket
  url: string;       // URL platforms can fetch (public base URL or signed URL)
  mime: string;
  size: number;
  filename: string;
  bytes: () => Promise<Buffer>; // downloads the file from storage (cached per publish)
};

export type PublishInput = {
  account: SocialAccount;
  caption: string;
  media: MediaFile[];
  options: Record<string, any>;
  /** What an earlier attempt of this target saved with `save` (an Instagram container id, say). */
  progress?: Record<string, any>;
  /** Merges state into `progress` for the next attempt of this target. A null value removes a key. */
  save?: (patch: Record<string, any>) => Promise<void>;
  /**
   * Called right before the request that creates the post on the platform. From then on a lost
   * answer means the post may exist, so the target is not sent again automatically.
   */
  sending?: () => Promise<void>;
};

export type PublishResult = { externalId: string; url?: string };

export type ConnectedAccountFields = {
  external_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: number;
  meta?: Record<string, any>;
};

export interface PlatformAdapter {
  platform: PlatformId;
  /** OAuth: build the authorization URL */
  getAuthUrl?(args: { state: string; redirectUri: string; codeChallenge?: string }): string;
  /** OAuth: exchange code for one or more accounts (e.g. one per Facebook Page) */
  exchangeCode?(args: { code: string; redirectUri: string; codeVerifier?: string }): Promise<ConnectedAccountFields[]>;
  /** Credentials mode (Bluesky) */
  connectWithCredentials?(creds: Record<string, string>): Promise<ConnectedAccountFields>;
  /** Refresh an expired token; returns updated token fields */
  refresh?(account: SocialAccount): Promise<Partial<ConnectedAccountFields>>;
  publish(input: PublishInput): Promise<PublishResult>;
}

export type PublishErrorInfo = {
  /** HTTP status the platform answered with, when there was one. */
  status?: number;
  /** The platform's own error code (Meta `error.code`, for example). */
  code?: number | string;
  /** true: the account's sign-in is no longer valid and it must be reconnected. */
  auth?: boolean;
  /** true: no answer came back (timeout, connection reset), so the platform may have acted on the request. */
  uncertain?: boolean;
  /** true: not a failure, the platform is still working (e.g. processing a video); check again later. */
  processing?: boolean;
};

/** A publishing failure. The message is short, readable and safe to show to users and in emails. */
export class PublishError extends Error {
  retryable: boolean;
  status?: number;
  code?: number | string;
  auth?: boolean;
  uncertain?: boolean;
  processing?: boolean;
  constructor(message: string, retryable = true, info: PublishErrorInfo = {}) {
    super(message);
    this.name = 'PublishError';
    this.retryable = retryable;
    Object.assign(this, info);
  }
}

/** Platform calls give up after this long. Uploads get longer (see `timeoutMs`). */
export const PLATFORM_TIMEOUT_MS = 60_000;
export const UPLOAD_TIMEOUT_MS = 180_000;

/*
 * Publishing deadline. A publishing run (cron or "publish now") sets one with `withDeadline`; every
 * platform call made inside it gives up in time for the run to record its results before the
 * serverless function is stopped.
 */
const deadlineStore = new AsyncLocalStorage<number>();
/** Kept free before the deadline for writing results. */
const DEADLINE_MARGIN_MS = 5_000;
const OUT_OF_TIME = 'Ran out of time in this publishing run. It will be retried.';
/** PublishError code for a request that was never sent because the run's deadline was too close. */
export const OUT_OF_TIME_CODE = 'out_of_time';

export function withDeadline<T>(deadline: number | undefined, fn: () => Promise<T>): Promise<T> {
  return deadline ? deadlineStore.run(deadline, fn) : fn();
}
/** Milliseconds left before the current run's deadline (Infinity outside a run). */
export function timeLeft(): number {
  const d = deadlineStore.getStore();
  return d ? d - DEADLINE_MARGIN_MS - Date.now() : Infinity;
}
/** Waits `ms`, or throws a retryable PublishError when the run's deadline would pass first. */
export async function sleep(ms: number) {
  if (timeLeft() < ms) throw new PublishError(OUT_OF_TIME, true, { code: OUT_OF_TIME_CODE });
  await new Promise((r) => setTimeout(r, ms));
}

/** fetch with a timeout. Platform APIs occasionally hang; without a limit a hung call stalls the whole publishing run. */
export function timedFetch(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = PLATFORM_TIMEOUT_MS, ...rest } = init;
  const left = timeLeft();
  // Not sent at all, so the platform certainly didn't act on it.
  if (left < 1_000) return Promise.reject(new PublishError(OUT_OF_TIME, true, { code: OUT_OF_TIME_CODE }));
  return fetch(url, { ...rest, signal: rest.signal ?? AbortSignal.timeout(Math.min(timeoutMs, left)) }).catch((e) => {
    throw networkError(e, url);
  });
}

const hostOf = (url: string) => {
  try { return new URL(url).host; } catch { return 'the platform'; }
};

/** A request that got no answer (timeout, network failure). The platform may still have acted on it. */
function networkError(e: any, url: string) {
  if (e instanceof PublishError) return e;
  const host = hostOf(url);
  if (e?.name === 'TimeoutError' || e?.name === 'AbortError') return new PublishError(`${host} did not answer in time`, true, { uncertain: true });
  return new PublishError(`Could not reach ${host}`, true, { uncertain: true });
}

const AUTH_RE = /invalid[_ ]?(access[_ ])?token|invalid[_ ]grant|access token|token (has )?expired|expired[_ ](access[_ ])?token|token.{0,40}(revoked|invalid|expired)|revoked|session has been invalidated|session (has )?expired|has not authori[sz]ed|unauthori[sz]ed|not logged in|re-?authori[sz]e/i;
/** Meta error codes for an invalid or expired access token (190) and an ended session (102). */
const META_AUTH_CODES = new Set([190, 102]);

/**
 * Whether a failure means the account's sign-in is no longer valid, so it needs reconnecting.
 * A generic "permission" error or a 403 that isn't about the token (a missing Page role, a blocked
 * feature) is not one: reconnecting won't fix it.
 */
export function isAuthError(e: unknown): boolean {
  if (e instanceof PublishError && e.auth !== undefined) return e.auth;
  if ((e as any)?.status === 401) return true;
  const msg = typeof e === 'string' ? e : String((e as any)?.message || e || '');
  return AUTH_RE.test(msg);
}

const clean = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\(?\s*fbtrace_id\s*[:=]?\s*[\w-]*\s*\)?/gi, '')
    .replace(/\s+/g, ' ')
    // "… See ." / "… visit:" left behind by a removed link.
    .replace(/\s*\b(see|visit|at|here)[\s:.]*$/i, '')
    .replace(/[\s:;,-]+$/, '')
    .trim();
const MAX_ERROR_CHARS = 200;
const cap = (s: string) => (s.length > MAX_ERROR_CHARS ? s.slice(0, MAX_ERROR_CHARS - 1).trimEnd() + '…' : s);

/**
 * A short, readable message from a platform's error answer: the human message Meta, X, LinkedIn,
 * Google, TikTok or Pinterest put in their JSON, without links, trace ids or the raw JSON.
 */
export function platformErrorMessage(data: unknown, status: number): string {
  const pick = (...vals: unknown[]) => vals.map((v) => (typeof v === 'string' ? clean(v) : '')).find(Boolean) || '';
  let msg = '';
  if (data && typeof data === 'object') {
    const d: any = data;
    const err = d.error && typeof d.error === 'object' ? d.error : null;
    const title = pick(err?.error_user_title);
    const user = pick(err?.error_user_msg, d.error_user_msg);
    msg = user ? (title && !user.startsWith(title) ? `${title}: ${user}` : user) : '';
    msg ||= pick(
      err?.message, d.error_description, d.detail, d.message, d.title,
      Array.isArray(d.errors) ? d.errors[0]?.message ?? d.errors[0]?.detail : undefined,
      typeof d.error === 'string' ? d.error : undefined,
    );
  } else if (typeof data === 'string' && !/^\s*</.test(data)) {
    msg = clean(data);
  }
  if (!msg) {
    msg = status === 429 ? 'The platform is limiting requests right now.'
      : status >= 500 ? 'The platform had a temporary problem.'
      : status === 401 ? 'The platform no longer accepts this account’s sign-in. Reconnect the account.'
      : `The platform refused the request (HTTP ${status}).`;
  }
  return cap(msg);
}

/**
 * Turns a platform's error answer into a PublishError with a readable message. The raw answer is
 * logged on the server only.
 */
export function errorFromAnswer(url: string, status: number, text: string): PublishError {
  let data: any = text;
  try { data = JSON.parse(text); } catch {}
  console.error(`[platform] ${status} from ${hostOf(url)}: ${String(text).slice(0, 2000)}`);
  const msg = platformErrorMessage(data, status);
  const err = data && typeof data === 'object' && data.error && typeof data.error === 'object' ? data.error : null;
  const code = err?.code ?? (data && typeof data === 'object' && ['number', 'string'].includes(typeof data.code) ? data.code : undefined);
  const oauthCode = data && typeof data === 'object' && typeof data.error === 'string' && /^(invalid_grant|invalid_token|unauthorized_client)$/.test(data.error);
  const auth = status === 401 || META_AUTH_CODES.has(Number(code)) || oauthCode || AUTH_RE.test(msg);
  return new PublishError(msg, status >= 500 || status === 429 || err?.is_transient === true, { status, code, auth });
}

/** Reads an error answer and turns it into a PublishError (see errorFromAnswer). */
export async function errorFromResponse(url: string, res: Response): Promise<PublishError> {
  return errorFromAnswer(url, res.status, await res.text().catch(() => ''));
}

export async function jsonFetch(url: string, init: RequestInit & { form?: Record<string, string>; timeoutMs?: number } = {}) {
  const { form, ...rest } = init;
  const headers: Record<string, string> = { ...(rest.headers as any) };
  let body = rest.body;
  if (form) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(form).toString();
  }
  // Uploads (FormData / raw bytes) are allowed more time than plain API calls.
  const timeoutMs = rest.timeoutMs ?? (body instanceof FormData || body instanceof Uint8Array ? UPLOAD_TIMEOUT_MS : PLATFORM_TIMEOUT_MS);
  let res: Response;
  let text: string;
  try {
    res = await timedFetch(url, { ...rest, headers, body, timeoutMs });
    text = await res.text();
  } catch (e: any) {
    throw networkError(e, url);
  }
  if (!res.ok) throw errorFromAnswer(url, res.status, text);
  let data: any = text;
  try { data = JSON.parse(text); } catch {}
  return data;
}

/**
 * The message stored on a failed target and shown in the dashboard and emails. PublishErrors are
 * already readable; anything else (a bug, a storage error) is summarised.
 */
export function userFacingError(e: unknown): string {
  const generic = 'Something went wrong on our side while publishing.';
  if (e instanceof PublishError) return cap(e.message);
  const err: any = e;
  if (!err?.message || err instanceof TypeError || err instanceof ReferenceError || err instanceof SyntaxError || err instanceof RangeError) return generic;
  return cap(clean(String(err.message))) || generic;
}

export const pkceChallenge = (verifier: string) =>
  createHash('sha256').update(verifier).digest('base64url');
