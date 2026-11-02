import 'server-only';
import { createHash } from 'node:crypto';
import { exec, now, one } from '@/lib/server/db';

/**
 * Daily cap for signed-out use of public tool endpoints (the free tools under /tools and the
 * programmatic pages call these without an account). The visitor is identified only by a hash of
 * IP + User-Agent + tool + UTC day with a server salt, so nothing identifying is stored and the
 * key is useless after the day ends. Signed-in users never go through this: their plan limits apply.
 */
export type CapResult = { allowed: boolean; used: number; limit: number; remaining: number; resetAt: number };

export const DEFAULT_ANON_LIMIT = 20;

export function utcDay(at = now()) {
  return new Date(at).toISOString().slice(0, 10);
}

export function nextUtcMidnight(at = now()) {
  const d = new Date(at);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}

export function clientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '0.0.0.0';
}

export function anonKey(req: Request, tool: string, day = utcDay()) {
  const salt = process.env.ANON_CAP_SALT || process.env.CRON_SECRET || 'sfy';
  const ua = req.headers.get('user-agent') || '';
  return createHash('sha256').update(`${salt}|${clientIp(req)}|${ua}|${tool}|${day}`).digest('hex');
}

/**
 * Counts one use of `tool` for this visitor and says whether it was within the day's limit.
 * When the database is unreachable the call is allowed (a tool that works beats a tool that
 * fails closed on a transient error); the error is logged.
 */
export async function takeAnonUse(req: Request, tool: string, limit = DEFAULT_ANON_LIMIT): Promise<CapResult> {
  const day = utcDay();
  const key = anonKey(req, tool, day);
  const resetAt = nextUtcMidnight();
  try {
    const row = await one<{ count: number }>(
      `INSERT INTO anon_tool_usage (key, day, count, updated_at) VALUES ($1, $2, 1, $3)
       ON CONFLICT (key) DO UPDATE SET count = anon_tool_usage.count + 1, updated_at = EXCLUDED.updated_at
       RETURNING count`,
      [key, day, now()],
    );
    const used = Number(row?.count ?? 1);
    return { allowed: used <= limit, used, limit, remaining: Math.max(0, limit - used), resetAt };
  } catch (e) {
    console.error('[anon-cap]', (e as Error)?.message || e);
    return { allowed: true, used: 0, limit, remaining: limit, resetAt };
  }
}

/** Headers for a capped response so clients can show "N left today". */
export function capHeaders(r: CapResult) {
  return {
    'X-RateLimit-Limit': String(r.limit),
    'X-RateLimit-Remaining': String(r.remaining),
    'X-RateLimit-Reset': String(Math.floor(r.resetAt / 1000)),
    ...(r.allowed ? {} : { 'Retry-After': String(Math.max(1, Math.ceil((r.resetAt - now()) / 1000))) }),
  };
}

/** Drops yesterday's rows; called from the daily cron. */
export async function cleanupAnonUsage() {
  return exec('DELETE FROM anon_tool_usage WHERE day < $1', [utcDay()]);
}
