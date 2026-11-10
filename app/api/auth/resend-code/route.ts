import { assertSameOrigin, body, errorResponse, json } from '@/lib/server/api';
import { allow, isEmail, normalizeEmail } from '@/lib/server/email-code';
import { neonAuth } from '@/lib/server/neon-auth';

/** Sends a fresh email confirmation code. Answers the same whether or not the address has an account. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const email = normalizeEmail((await body<{ email?: string }>(req)).email);
    if (!isEmail(email)) return json({ error: 'Enter a valid email' }, 400);
    if (!allow('resend', email, [{ windowMs: 30_000, max: 1 }, { windowMs: 60 * 60_000, max: 5 }])) {
      return json({ error: 'A code was just sent. Wait a moment before asking for another.' }, 429);
    }
    const { error } = await neonAuth().emailOtp.sendVerificationOtp({ email, type: 'email-verification' });
    if (error && (!error.status || error.status >= 500)) return json({ error: 'Could not send a new code. Try again in a minute.' }, 502);
    return json({ ok: true, message: `If ${email} has an account waiting for confirmation, a new code is on its way.` });
  } catch (e) {
    return errorResponse(e);
  }
}
