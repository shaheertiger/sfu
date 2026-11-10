import { ensureUser } from '@/lib/server/auth';
import { assertSameOrigin, body, errorResponse, json } from '@/lib/server/api';
import { allow, codeErrorMessage, isEmail, normalizeEmail } from '@/lib/server/email-code';
import { neonAuth } from '@/lib/server/neon-auth';
import { setSignedInHint } from '@/lib/server/signed-in-hint';

/**
 * Checks the 6-digit code from the confirmation email. Neon Auth marks the email verified and, with
 * "auto sign-in after verification" on, returns a session (its cookies are set on this response).
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const input = await body<{ email?: string; code?: string }>(req);
    const email = normalizeEmail(input.email);
    const code = String(input.code || '').replace(/\s+/g, '');
    if (!isEmail(email) || !/^\d{4,10}$/.test(code)) return json({ error: 'Enter the 6-digit code from the email' }, 400);
    if (!allow('confirm', email, [{ windowMs: 15 * 60_000, max: 10 }])) return json({ error: 'Too many tries. Wait a few minutes, then send a new code.' }, 429);

    const { data, error } = await neonAuth().emailOtp.verifyEmail({ email, otp: code });
    if (error) return json({ error: codeErrorMessage(error) }, error.status && error.status < 500 ? 400 : 502);

    const user = (data as any)?.user;
    // No session (auto sign-in off): the email is confirmed, they sign in with their password.
    if (!(data as any)?.token || !user) return json({ ok: true, signIn: true, message: 'Email confirmed. Sign in to continue.' });
    await ensureUser(user);
    await setSignedInHint(true);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
