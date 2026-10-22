import { createHash } from 'node:crypto';
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

export class PublishError extends Error {
  retryable: boolean;
  constructor(message: string, retryable = true) {
    super(message);
    this.retryable = retryable;
  }
}

/** Platform calls give up after this long. Uploads get longer (see `timeoutMs`). */
export const PLATFORM_TIMEOUT_MS = 60_000;
export const UPLOAD_TIMEOUT_MS = 180_000;

/** fetch with a timeout. Platform APIs occasionally hang; without a limit a hung call stalls the whole publishing run. */
export function timedFetch(url: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = PLATFORM_TIMEOUT_MS, ...rest } = init;
  return fetch(url, { ...rest, signal: rest.signal ?? AbortSignal.timeout(timeoutMs) });
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
  try {
    res = await timedFetch(url, { ...rest, headers, body, timeoutMs });
  } catch (e: any) {
    const host = (() => { try { return new URL(url).host; } catch { return url; } })();
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') throw new PublishError(`${host} did not answer within ${Math.round(timeoutMs / 1000)}s`, true);
    throw new PublishError(`Could not reach ${host}: ${e?.message || e}`, true);
  }
  const text = await res.text();
  let data: any = text;
  try { data = JSON.parse(text); } catch {}
  if (!res.ok) {
    const msg = typeof data === 'object' ? JSON.stringify(data).slice(0, 500) : text.slice(0, 500);
    throw new PublishError(`${res.status} from ${new URL(url).host}: ${msg}`, res.status >= 500 || res.status === 429);
  }
  return data;
}

export const pkceChallenge = (verifier: string) =>
  createHash('sha256').update(verifier).digest('base64url');
