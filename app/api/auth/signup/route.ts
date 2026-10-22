import { z } from 'zod';
import { ensureUser } from '@/lib/server/auth';
import { body, errorResponse, json } from '@/lib/server/api';
import { neonAuth } from '@/lib/server/neon-auth';

const Input = z.object({ email: z.string().email().max(200), password: z.string().min(8).max(200), name: z.string().max(80).optional() });

/** Creates the Neon Auth account (which signs the user in) and the app profile + first workspace. */
export async function POST(req: Request) {
  try {
    const parsed = Input.safeParse(await body(req));
    if (!parsed.success) return json({ error: 'Enter a valid email and a password of at least 8 characters' }, 400);
    const { email, password, name } = parsed.data;
    const { data, error } = await neonAuth().signUp.email({ email: email.toLowerCase(), password, name: (name || email.split('@')[0]).trim() });
    if (error) {
      if (/ALREADY_EXISTS|already exists/i.test(`${error.code} ${error.message}`)) return json({ error: 'That email already has an account. Sign in instead.' }, 409);
      return json({ error: error.message || 'Could not create the account' }, error.status && error.status < 500 ? 400 : 502);
    }
    if (!data?.user) return json({ error: 'Could not create the account' }, 502);
    await ensureUser(data.user);
    // No token means Neon Auth is set to verify emails before the first sign-in.
    if (!data.token) return json({ ok: true, verify: true, message: 'Check your email to confirm your address, then sign in.' });
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
