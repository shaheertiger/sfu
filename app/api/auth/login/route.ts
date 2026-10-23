import { ensureUser } from '@/lib/server/auth';
import { assertSameOrigin, body, errorResponse, json } from '@/lib/server/api';
import { now } from '@/lib/server/db';
import { neonAuth } from '@/lib/server/neon-auth';
import { setSignedInHint } from '@/lib/server/signed-in-hint';

// Simple brute-force guard on top of Neon Auth's own: at most 10 failed attempts per email per 15 minutes.
const WINDOW = 15 * 60_000, MAX_FAILS = 10;
const fails = new Map<string, number[]>();
function prune(nowMs: number) {
  if (fails.size < 1000) return;
  for (const [k, v] of fails) if (!v.some((t) => t > nowMs - WINDOW)) fails.delete(k);
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { email, password } = await body<{ email?: string; password?: string }>(req);
    const key = String(email || '').trim().toLowerCase();
    prune(now());
    const recent = (fails.get(key) || []).filter((t) => t > now() - WINDOW);
    if (recent.length >= MAX_FAILS) return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);
    if (!key || !password) return json({ error: 'Wrong email or password' }, 401);
    const { data, error } = await neonAuth().signIn.email({ email: key, password: String(password) });
    if (error || !data?.user) {
      if (/EMAIL_NOT_VERIFIED|not verified/i.test(`${error?.code} ${error?.message}`)) return json({ error: 'Confirm your email first. Check your inbox for the link.' }, 403);
      if (error && error.status !== 401) return json({ error: error.message || 'Sign-in failed' }, error.status && error.status < 500 ? error.status : 502);
      fails.set(key, [...recent, now()]);
      return json({ error: 'Wrong email or password' }, 401);
    }
    fails.delete(key);
    await ensureUser(data.user);
    await setSignedInHint(true);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
