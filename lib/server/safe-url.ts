import 'server-only';
import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { HttpError } from './http-error';

/**
 * Outbound URLs that users type in (webhooks, RSS feeds). Blocks internal addresses so the server
 * can't be pointed at private networks or cloud metadata endpoints. ALLOW_PRIVATE_URLS=1 lifts
 * this for local development and tests only.
 */
/** Parses dotted IPv4 into a 32-bit number, or null. */
function ipv4ToInt(ip: string): number | null {
  if (!net.isIPv4(ip)) return null;
  return ip.split('.').reduce((n, o) => n * 256 + Number(o), 0);
}

/** IPv4 ranges that are never a public server: private, loopback, link-local, CGNAT, multicast, reserved, documentation. */
const PRIVATE_V4: [number, number][] = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
].map(([base, bits]) => [ipv4ToInt(base as string)!, bits as number]);

function isPrivateV4(ip: string) {
  const n = ipv4ToInt(ip);
  if (n === null) return true; // not an address at all: refuse
  return PRIVATE_V4.some(([base, bits]) => Math.floor(n / 2 ** (32 - bits)) === Math.floor(base / 2 ** (32 - bits)));
}

/** Expands an IPv6 address into its 8 hextets (numbers), or null when it isn't one. */
function hextets(ip: string): number[] | null {
  const addr = ip.replace(/%.*$/, ''); // drop zone id
  if (!net.isIPv6(addr)) return null;
  let v6 = addr;
  // Trailing dotted IPv4 (::ffff:10.0.0.1) → two hextets.
  const m = /^(.*:)(\d+\.\d+\.\d+\.\d+)$/.exec(v6);
  if (m) {
    const n = ipv4ToInt(m[2]);
    if (n === null) return null;
    v6 = `${m[1]}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const [head, tail = ''] = v6.split('::');
  const hs = head ? head.split(':') : [];
  const ts = tail ? tail.split(':') : [];
  const fill = v6.includes('::') ? Array(8 - hs.length - ts.length).fill('0') : [];
  const parts = [...hs, ...fill, ...ts];
  if (parts.length !== 8) return null;
  return parts.map((h) => parseInt(h, 16));
}

const v4FromHextets = (hi: number, lo: number) => `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;

/**
 * True for any address that must never be fetched on a user's behalf: private networks, loopback,
 * link-local (cloud metadata lives at 169.254.169.254), multicast, and IPv6 forms that embed such an
 * IPv4 address (IPv4-mapped ::ffff:a.b.c.d, NAT64 64:ff9b::/96, 6to4 2002::/16).
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  const h = hextets(ip);
  if (!h) return true;
  const [h0, h1, h2, h3, h4, h5, h6, h7] = h;
  if (h0 === 0 && h1 === 0 && h2 === 0 && h3 === 0 && h4 === 0) {
    if (h5 === 0xffff) return isPrivateV4(v4FromHextets(h6, h7)); // IPv4-mapped
    if (h5 === 0) return h6 === 0 && (h7 === 0 || h7 === 1) ? true : isPrivateV4(v4FromHextets(h6, h7)); // ::, ::1, IPv4-compatible
  }
  if (h0 === 0x64 && h1 === 0xff9b && h2 === 0 && h3 === 0 && h4 === 0 && h5 === 0) return isPrivateV4(v4FromHextets(h6, h7)); // NAT64
  if (h0 === 0x2002) return isPrivateV4(v4FromHextets(h1, h2)); // 6to4
  if ((h0 & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((h0 & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((h0 & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local (deprecated)
  if ((h0 & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (h0 === 0x2001 && h1 === 0xdb8) return true; // documentation
  return false;
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
