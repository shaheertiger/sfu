import { now } from './db';

/**
 * Per-email throttles for the email confirmation code (per server instance, on top of Neon Auth's own limits:
 * a code dies after a few wrong tries and expires after 15 minutes).
 */
type Window = { windowMs: number; max: number };
const buckets = new Map<string, number[]>();

/** True if `key` may act now under every window; records the hit when allowed. */
export function allow(scope: string, email: string, windows: Window[]): boolean {
  const key = `${scope}:${email}`;
  const t = now();
  const longest = Math.max(...windows.map((w) => w.windowMs));
  const hits = (buckets.get(key) || []).filter((h) => h > t - longest);
  if (windows.some((w) => hits.filter((h) => h > t - w.windowMs).length >= w.max)) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(t);
  buckets.set(key, hits);
  if (buckets.size > 2000) for (const [k, v] of buckets) if (!v.some((h) => h > t - longest)) buckets.delete(k);
  return true;
}

export const normalizeEmail = (v: unknown) => String(v || '').trim().toLowerCase();
export const isEmail = (v: string) => v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Turns a Neon Auth (Better Auth email-otp) error into a sentence for the code screen. */
export function codeErrorMessage(error: { code?: string; message?: string } | null | undefined): string {
  const s = `${error?.code || ''} ${error?.message || ''}`;
  if (/TOO_MANY_ATTEMPTS|too many/i.test(s)) return 'Too many wrong tries. Send a new code and try again.';
  if (/EXPIRED|expired/i.test(s)) return 'That code has expired. Send a new one.';
  if (/INVALID_OTP|invalid|OTP/i.test(s)) return "That code isn't right. Check the latest email and try again.";
  return 'Could not confirm your email. Try again or send a new code.';
}
