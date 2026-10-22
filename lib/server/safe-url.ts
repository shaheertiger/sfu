import 'server-only';
import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { HttpError } from './auth';

/**
 * Outbound URLs that users type in (webhooks, RSS feeds). Blocks internal addresses so the server
 * can't be pointed at private networks or cloud metadata endpoints. ALLOW_PRIVATE_URLS=1 lifts
 * this for local development and tests only.
 */
function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7));
  return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new HttpError(400, 'Enter a full URL, starting with https://');
  }
  const allowPrivate = process.env.ALLOW_PRIVATE_URLS === '1';
  if (url.protocol !== 'https:' && !(allowPrivate && url.protocol === 'http:')) throw new HttpError(400, 'The URL must start with https://');
  if (url.username || url.password) throw new HttpError(400, 'Remove the username and password from the URL');
  if (allowPrivate) return url;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new HttpError(400, 'That address is not reachable from the internet');
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new HttpError(400, `Could not find ${host}`);
  if (addrs.some((a) => isPrivateIp(a.address))) throw new HttpError(400, 'That address is not reachable from the internet');
  return url;
}

/** fetch with a timeout and a response size cap. Redirects are followed manually so each hop is checked. */
export async function safeFetch(raw: string, init: RequestInit & { timeoutMs?: number; maxBytes?: number } = {}) {
  const { timeoutMs = 10_000, maxBytes = 2_000_000, ...rest } = init;
  let target = raw;
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicUrl(target);
    const res = await fetch(target, { ...rest, redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      target = new URL(res.headers.get('location')!, target).toString();
      continue;
    }
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          throw new Error(`Response is larger than ${Math.round(maxBytes / 1e6)} MB`);
        }
        chunks.push(value);
      }
    }
    return { status: res.status, ok: res.ok, text: Buffer.concat(chunks).toString('utf8'), url: target };
  }
  throw new Error('Too many redirects');
}
