import type { NextRequest } from 'next/server';

// Signed-out visitors to the dashboard go to /login (and come back afterwards via ?next=).
// Neon Auth's middleware also refreshes the session cookie. Real checks happen in the API.
let gate: ((req: NextRequest) => Promise<Response>) | null = null;

export async function proxy(req: NextRequest) {
  if (!gate) {
    const { neonAuth } = await import('@/lib/server/neon-auth');
    gate = neonAuth().middleware({ loginUrl: '/login' });
  }
  const res = await gate(req);
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

export const config = { matcher: ['/app', '/app/:path*'] };
