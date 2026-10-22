import { createSession, setSessionCookie, verifyPassword } from '@/lib/server/auth';
import { body, errorResponse, json } from '@/lib/server/api';
import { exec, now, one } from '@/lib/server/db';

// Simple brute-force guard: at most 10 failed attempts per email per 15 minutes.
const WINDOW = 15 * 60_000, MAX_FAILS = 10;
const fails = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    const { email, password } = await body<{ email?: string; password?: string }>(req);
    const key = String(email || '').toLowerCase();
    const recent = (fails.get(key) || []).filter((t) => t > now() - WINDOW);
    if (recent.length >= MAX_FAILS) return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);
    const u = await one('SELECT id, password_hash FROM users WHERE email=$1', [key]);
    if (!u || !verifyPassword(String(password || ''), u.password_hash)) {
      fails.set(key, [...recent, now()]);
      return json({ error: 'Wrong email or password' }, 401);
    }
    fails.delete(key);
    await exec('DELETE FROM sessions WHERE user_id=$1 AND expires_at<$2', [u.id, now()]);
    await setSessionCookie(await createSession(u.id));
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
