import { NextRequest, NextResponse } from 'next/server';

// Signed-out visitors to the dashboard go to /login (and come back afterwards via ?next=).
// Neon Auth's middleware also refreshes the session cookie. Real checks happen in the API.
let gate: ((req: NextRequest) => Promise<Response>) | null = null;

export async function proxy(req: NextRequest) {
  if (!gate) {
    const { neonAuth } = await import('@/lib/server/neon-auth');
    gate = neonAuth().middleware({ loginUrl: '/login' });
  }
  const hasSessionCookie = (req.headers.get('cookie') || '').includes('neon-auth.session_token');
  // Already signed in? /login and /signup go straight to the dashboard (or the ?next= page).
  if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') {
    if (!hasSessionCookie) return NextResponse.next();
    const check = await gate(new NextRequest(new URL('/app', req.url), { headers: req.headers }));
    if (isLoginRedirect(check, req)) return NextResponse.next();
    const next = req.nextUrl.searchParams.get('next');
    const safe = next && /^\/(?![\/\\])/.test(next) ? next : '/app'; // same-site paths only
    const to = new URL(safe, req.url);
    if (to.origin !== req.nextUrl.origin) to.href = new URL('/app', req.url).href;
    const res = NextResponse.redirect(to);
    for (const c of check.headers.getSetCookie()) res.headers.append('Set-Cookie', c);
    return res;
  }
  let res = await gate(req);
  // A session check that fails while Neon Auth wakes up looks like "signed out". If the browser
  // still has a session cookie, try again before sending anyone to the login page.
  for (let attempt = 0; hasSessionCookie && attempt < 2 && isLoginRedirect(res, req); attempt++) {
    await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    res = await gate(req);
  }
  const location = res.headers.get('location');
  if (location) {
    const url = new URL(location, req.url);
    if (url.pathname === '/login' && !url.searchParams.has('next')) {
      url.searchParams.set('next', req.nextUrl.pathname);
      res.headers.set('location', url.toString());
    }
  }
  return res;
}

function isLoginRedirect(res: Response, req: NextRequest) {
  const location = res.headers.get('location');
  return !!location && new URL(location, req.url).pathname === '/login';
}

export const config = { matcher: ['/app', '/app/:path*', '/login', '/signup'] };
