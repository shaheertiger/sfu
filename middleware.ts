import { NextResponse, type NextRequest } from 'next/server';

// Cheap gate: no session cookie → send to sign-in. Real checks happen in the API.
export function middleware(req: NextRequest) {
  if (!req.cookies.get('sfy_session')) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/app', '/app/:path*'] };
