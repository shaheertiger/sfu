import { NextResponse } from 'next/server';
import { COOKIE, COOKIE_MAX_AGE, workspaceForCode } from '@/lib/server/referrals';

export const dynamic = 'force-dynamic';

/**
 * Referral link. Remembers who sent the visitor (30 days) and sends them to sign up.
 * Unknown or malformed codes still land on /signup, without the bonus.
 */
export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const ws = await workspaceForCode(code).catch(() => null);
  const to = new URL(ws ? `/signup?ref=${encodeURIComponent(code.toLowerCase())}` : '/signup', req.url);
  const res = NextResponse.redirect(to, 302);
  res.headers.set('X-Robots-Tag', 'noindex');
  res.headers.set('Cache-Control', 'no-store');
  if (ws) {
    res.cookies.set(COOKIE, code.toLowerCase(), {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: to.protocol === 'https:',
    });
  }
  return res;
}
