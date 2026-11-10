import 'server-only';
import crypto from 'node:crypto';
import { exec, one } from './db';
import { emailConfigured, esc, layout, sendEmail, type Email } from './email';
import { siteUrl } from '../site';

/**
 * Receiver for Neon Auth (Managed Better Auth) webhooks: https://neon.com/docs/auth/guides/webhooks
 * Subscribed to `send.magic_link` and `send.otp`, so Neon skips its own email and we send a branded one through
 * Resend (password reset, email confirmation code or link, magic sign-in link, sign-in code).
 *
 * Signature: Ed25519 detached JWS in X-Neon-Signature (`header..signature`), key picked by X-Neon-Signature-Kid
 * from `<NEON_AUTH_BASE_URL>/.well-known/jwks.json`. Signed bytes:
 *   header + "." + base64url(timestamp + "." + base64url(rawBody))   (timestamp = X-Neon-Timestamp, ms)
 *
 * Answers: 2xx = handled (or ignored); 401 = bad signature (Neon doesn't retry 4xx); 5xx = try again
 * (Neon retries up to 3 times within 15 s, then the user sees an error).
 */

export const MAX_SKEW_MS = 5 * 60_000;
const MAX_BODY_BYTES = 64 * 1024;

export type KeyResolver = (kid: string) => Promise<crypto.KeyObject | null>;
/** Remembers which events were already delivered, so Neon's retries don't send a second email. */
export type EventStore = { seen(id: string): Promise<boolean>; mark(id: string, type: string): Promise<void> };
export type WebhookDeps = {
  resolveKey: KeyResolver;
  store: EventStore;
  send: (mail: Email) => Promise<unknown>;
  emailReady: () => boolean;
  siteUrl: () => string;
  now: () => number;
};
export type WebhookResult = { status: number; body: Record<string, unknown> };

export class WebhookError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------- Signature ----------

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');

/** The bytes Neon signs (detached JWS with the timestamp bound into the payload). */
export function signingInput(headerB64: string, timestamp: string, rawBody: string) {
  return `${headerB64}.${b64url(`${timestamp}.${b64url(rawBody)}`)}`;
}

/** Throws WebhookError(401) unless the request carries a fresh, valid Neon signature. */
export async function verifyNeonSignature(rawBody: string, headers: Headers, resolveKey: KeyResolver, nowMs = Date.now()) {
  const signature = headers.get('x-neon-signature') || '';
  const kid = headers.get('x-neon-signature-kid') || '';
  const timestamp = headers.get('x-neon-timestamp') || '';
  if (!signature || !kid || !timestamp) throw new WebhookError(401, 'Missing Neon signature headers');

  const parts = signature.split('.');
  if (parts.length !== 3 || parts[1] !== '' || !parts[0] || !parts[2]) throw new WebhookError(401, 'Malformed signature');
  const [headerB64, , sigB64] = parts;
  let jwsHeader: any;
  try {
    jwsHeader = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
  } catch {
    throw new WebhookError(401, 'Malformed signature header');
  }
  if (jwsHeader?.alg && jwsHeader.alg !== 'EdDSA') throw new WebhookError(401, `Unexpected signature algorithm ${jwsHeader.alg}`);

  if (!/^\d{1,16}$/.test(timestamp)) throw new WebhookError(401, 'Bad timestamp');
  if (Math.abs(nowMs - Number(timestamp)) > MAX_SKEW_MS) throw new WebhookError(401, 'Timestamp outside the 5-minute window');

  const key = await resolveKey(kid);
  if (!key) throw new WebhookError(401, `Unknown signing key ${kid}`);
  if (key.asymmetricKeyType !== 'ed25519') throw new WebhookError(401, 'Signing key is not Ed25519');

  const ok = crypto.verify(null, Buffer.from(signingInput(headerB64, timestamp, rawBody)), key, Buffer.from(sigB64, 'base64url'));
  if (!ok) throw new WebhookError(401, 'Invalid signature');
}

/**
 * Public keys from Neon's JWKS, cached in memory. An unknown kid triggers a refetch
 * (at most every 10 s), which picks up rotated keys without a redeploy.
 */
export function jwksKeyResolver(jwksUrl: () => string | undefined, fetchImpl: typeof fetch = fetch, nowFn = Date.now): KeyResolver {
  let keys = new Map<string, crypto.KeyObject>();
  let fetchedAt = 0;
  const REFETCH_MS = 10_000, MAX_AGE_MS = 24 * 3600_000;

  async function load() {
    const url = jwksUrl();
    if (!url) throw new WebhookError(503, 'NEON_AUTH_BASE_URL is not set, so Neon webhook signatures cannot be checked');
    const res = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new WebhookError(503, `Could not load Neon JWKS (${res.status})`);
    const jwks: any = await res.json();
    const next = new Map<string, crypto.KeyObject>();
    for (const jwk of Array.isArray(jwks?.keys) ? jwks.keys : []) {
      if (!jwk?.kid || jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519') continue;
      try {
        next.set(jwk.kid, crypto.createPublicKey({ key: jwk, format: 'jwk' }));
      } catch {
        /* skip keys Node can't import */
      }
    }
    keys = next;
    fetchedAt = nowFn();
  }

  return async (kid) => {
    const age = nowFn() - fetchedAt;
    if (!fetchedAt || age > MAX_AGE_MS || (!keys.has(kid) && age > REFETCH_MS)) await load();
    return keys.get(kid) ?? null;
  };
}

// ---------- Dedupe ----------

/** In-memory LRU of delivered event ids (per server instance). */
export function memoryEventStore(max = 1000): EventStore {
  const ids = new Map<string, true>();
  return {
    async seen(id) {
      return ids.has(id);
    },
    async mark(id) {
      ids.delete(id);
      ids.set(id, true);
      while (ids.size > max) ids.delete(ids.keys().next().value!);
    },
  };
}

/**
 * Memory first, then the neon_auth_events table so retries landing on another instance are caught too.
 * Database trouble never blocks an auth email: errors are logged and the email is sent.
 */
function defaultEventStore(): EventStore {
  const mem = memoryEventStore();
  return {
    async seen(id) {
      if (await mem.seen(id)) return true;
      try {
        return !!(await one('SELECT id FROM neon_auth_events WHERE id=$1', [id]));
      } catch (e: any) {
        console.warn('[neon-auth webhook] dedupe lookup failed:', e?.message || e);
        return false;
      }
    },
    async mark(id, type) {
      await mem.mark(id, type);
      try {
        const t = Date.now();
        await exec('INSERT INTO neon_auth_events (id, type, created_at) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING', [id, type, t]);
        // Ids only matter for the few seconds Neon retries; keep a week and trim now and then.
        if (Math.random() < 0.02) await exec('DELETE FROM neon_auth_events WHERE created_at < $1', [t - 7 * 86400_000]);
      } catch (e: any) {
        console.warn('[neon-auth webhook] dedupe record failed:', e?.message || e);
      }
    },
  };
}

// ---------- Emails ----------

type MagicLinkPayload = {
  event_id?: string;
  event_type?: string;
  user?: { email?: string; name?: string };
  event_data?: { link_type?: string; link_url?: string; token?: string; expires_at?: string };
};
type OtpPayload = {
  event_id?: string;
  event_type?: string;
  user?: { email?: string; name?: string };
  event_data?: { otp_code?: string; otp_type?: string; delivery_preference?: string; expires_at?: string };
};

/** "15 minutes", "1 hour", "3 days"; null when unknown or already past. */
export function expiresIn(expiresAt: string | undefined, nowMs: number): string | null {
  const t = expiresAt ? Date.parse(expiresAt) : NaN;
  if (!Number.isFinite(t) || t <= nowMs) return null;
  const minutes = Math.max(1, Math.round((t - nowMs) / 60_000));
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  if (minutes < 60) return plural(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 48) return plural(hours, 'hour');
  return plural(Math.round(hours / 24), 'day');
}

const P = (html: string) => `<p style="margin:0 0 12px;line-height:1.5">${html}</p>`;
const SMALL = (html: string) => `<p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#677184">${html}</p>`;

/** Builds the branded email for a send.magic_link event, or null for a link type we don't handle. */
export function magicLinkEmail(payload: MagicLinkPayload, base: string, nowMs: number): Email | null {
  const data = payload.event_data || {};
  const to = String(payload.user?.email || '').trim();
  if (!to) throw new WebhookError(400, 'send.magic_link without user.email');
  const name = String(payload.user?.name || '').trim();
  const hi = name ? `Hi ${name},` : 'Hi,';
  const left = expiresIn(data.expires_at, nowMs);

  let subject: string, title: string, intro: string, button: string, footer: string, url: string, expiry: string;
  switch (data.link_type) {
    case 'forget-password': {
      if (!data.token) throw new WebhookError(400, 'forget-password link without a token');
      url = `${base.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(data.token)}`;
      subject = 'Reset your Schedule For You password';
      title = 'Reset your password';
      intro = `Someone asked to reset the password for the Schedule For You account ${to}. Choose a new password with the button below.`;
      button = 'Choose a new password';
      expiry = left ? `The link works once and expires in ${left}.` : 'The link works once and expires soon.';
      footer = "You got this email because someone asked to reset the password for this address. If it wasn't you, ignore it and your password stays the same.";
      break;
    }
    case 'email-verification':
    case 'sign-in': {
      url = String(data.link_url || '');
      if (!/^https:\/\//i.test(url)) throw new WebhookError(400, `${data.link_type} link without a valid link_url`);
      const verify = data.link_type === 'email-verification';
      subject = verify ? 'Confirm your email for Schedule For You' : 'Your Schedule For You sign-in link';
      title = verify ? 'Confirm your email' : 'Sign in to Schedule For You';
      intro = verify
        ? `Confirm that ${to} is your email address to finish setting up your Schedule For You account.`
        : `Use the button below to sign in to Schedule For You as ${to}.`;
      button = verify ? 'Confirm email' : 'Sign in';
      expiry = left ? `The link expires in ${left}.` : 'The link expires soon.';
      footer = verify
        ? "You got this email because this address was used to sign up for Schedule For You. If it wasn't you, ignore it."
        : "You got this email because someone asked to sign in to Schedule For You with this address. If it wasn't you, ignore it.";
      break;
    }
    default:
      return null;
  }

  const fallback = SMALL(`If the button doesn't work, copy this link into your browser:<br><a href="${esc(url)}" style="color:#15171a;word-break:break-all">${esc(url)}</a>`);
  const html = layout(title, P(esc(hi)) + P(esc(intro)) + P(esc(expiry)), { label: button, url }, { footer, afterCta: fallback });
  const text = [hi, '', intro, '', `${button}: ${url}`, '', expiry, '', '— Schedule For You', '', footer].join('\n');
  return { to, subject, html, text };
}

/** Builds the branded email for a send.otp event (a 6-digit code), or null for a type we don't handle. */
export function otpEmail(payload: OtpPayload, nowMs: number): Email | null {
  const data = payload.event_data || {};
  // SMS codes come from the Phone Number plugin, which we don't use.
  if (data.delivery_preference && data.delivery_preference !== 'email') return null;
  const to = String(payload.user?.email || '').trim();
  if (!to) throw new WebhookError(400, 'send.otp without user.email');
  const code = String(data.otp_code || '').trim();
  if (!/^[0-9A-Za-z]{4,12}$/.test(code)) throw new WebhookError(400, 'send.otp without a valid otp_code');
  const name = String(payload.user?.name || '').trim();
  const hi = name ? `Hi ${name},` : 'Hi,';
  const left = expiresIn(data.expires_at, nowMs);

  let subject: string, title: string, intro: string, footer: string;
  switch (data.otp_type) {
    case 'email-verification':
      subject = `${code} is your Schedule For You confirmation code`;
      title = 'Confirm your email';
      intro = `Enter this code to confirm ${to} and finish setting up your Schedule For You account.`;
      footer = "You got this email because this address was used to sign up for Schedule For You. If it wasn't you, ignore it.";
      break;
    case 'sign-in':
      subject = `${code} is your Schedule For You sign-in code`;
      title = 'Your sign-in code';
      intro = `Enter this code to sign in to Schedule For You as ${to}.`;
      footer = "You got this email because someone asked to sign in to Schedule For You with this address. If it wasn't you, ignore it.";
      break;
    case 'forget-password':
      subject = `${code} is your Schedule For You password reset code`;
      title = 'Reset your password';
      intro = `Enter this code to choose a new password for the Schedule For You account ${to}.`;
      footer = "You got this email because someone asked to reset the password for this address. If it wasn't you, ignore it and your password stays the same.";
      break;
    default:
      return null;
  }

  const expiry = left ? `The code expires in ${left}.` : 'The code expires soon.';
  const codeBlock = `<p style="margin:8px 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#15171a">${esc(code)}</p>`;
  const html = layout(title, P(esc(hi)) + P(esc(intro)) + codeBlock + P(esc(expiry)) + SMALL("Don't share this code with anyone. We'll never ask you for it."), undefined, { footer });
  const text = [hi, '', intro, '', code, '', expiry, "Don't share this code with anyone.", '', '— Schedule For You', '', footer].join('\n');
  return { to, subject, html, text };
}

// ---------- Handler ----------

let defaults: WebhookDeps | null = null;
function defaultDeps(): WebhookDeps {
  defaults ??= {
    resolveKey: jwksKeyResolver(() => {
      const base = process.env.NEON_AUTH_BASE_URL?.replace(/\/$/, '');
      return base ? `${base}/.well-known/jwks.json` : undefined;
    }),
    store: defaultEventStore(),
    send: sendEmail,
    emailReady: emailConfigured,
    siteUrl,
    now: Date.now,
  };
  return defaults;
}

const inflight = new Map<string, Promise<WebhookResult>>();

/** Verifies and handles one Neon Auth webhook delivery. Never throws. */
export async function handleNeonAuthWebhook(rawBody: string, headers: Headers, overrides: Partial<WebhookDeps> = {}): Promise<WebhookResult> {
  try {
    const deps = { ...defaultDeps(), ...overrides };
    if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) throw new WebhookError(413, 'Payload too large');
    await verifyNeonSignature(rawBody, headers, deps.resolveKey, deps.now());

    let payload: MagicLinkPayload & OtpPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new WebhookError(400, 'Body is not JSON');
    }
    const type = String(payload?.event_type || headers.get('x-neon-event-type') || '');
    // The body's event_id is covered by the signature; the header is the fallback.
    const id = String(payload?.event_id || headers.get('x-neon-event-id') || '');

    if (type !== 'send.magic_link' && type !== 'send.otp') {
      console.log(`[neon-auth webhook] ignored event ${type || '(none)'} ${id}`);
      return { status: 200, body: { ok: true, ignored: true } };
    }
    if (!id) throw new WebhookError(400, 'Missing event id');

    // A retry reaching this instance while the first attempt is still sending waits for that attempt.
    const running = inflight.get(id);
    if (running) return await running;
    const work = deliver(id, type, payload, deps);
    inflight.set(id, work);
    try {
      return await work;
    } finally {
      inflight.delete(id);
    }
  } catch (e: any) {
    if (e instanceof WebhookError) {
      (e.status >= 500 ? console.error : console.warn)(`[neon-auth webhook] ${e.status}: ${e.message}`);
      return { status: e.status, body: { error: e.message } };
    }
    console.error('[neon-auth webhook] failed:', e?.message || e);
    return { status: 500, body: { error: 'Webhook handling failed' } };
  }
}

async function deliver(id: string, type: string, payload: MagicLinkPayload & OtpPayload, deps: WebhookDeps): Promise<WebhookResult> {
  if (await deps.store.seen(id)) {
    console.log(`[neon-auth webhook] duplicate ${id}, already sent`);
    return { status: 200, body: { ok: true, duplicate: true } };
  }
  const otp = type === 'send.otp';
  const kind = String((otp ? payload.event_data?.otp_type : payload.event_data?.link_type) || '(none)');
  const mail = otp ? otpEmail(payload, deps.now()) : magicLinkEmail(payload, deps.siteUrl(), deps.now());
  if (!mail) {
    console.log(`[neon-auth webhook] ignored ${type} ${kind} ${id}`);
    return { status: 200, body: { ok: true, ignored: true } };
  }
  if (!deps.emailReady()) {
    // 5xx so Neon retries; if it stays unconfigured the user sees an error instead of waiting for an email that never comes.
    throw new WebhookError(500, `RESEND_API_KEY is not set; cannot send "${mail.subject}". Configure Resend or turn off the Neon Auth webhook.`);
  }
  try {
    await deps.send(mail);
  } catch (e: any) {
    throw new WebhookError(502, `Email send failed: ${e?.message || e}`);
  }
  await deps.store.mark(id, `${type}:${kind}`);
  console.log(`[neon-auth webhook] sent ${type} ${kind} email for ${id}`);
  return { status: 200, body: { ok: true } };
}
