import { NextRequest, NextResponse } from 'next/server';
import { acceptsNeither, markdownTarget } from '@/lib/md/negotiate';
import { isMarkdownPath } from '@/lib/md/registry';
import { AEO_VERSION } from '@/lib/md/http';
import { siteUrl } from '@/lib/site';

/** Where agents find the site map for models, the full content and the usage policy (lib/md). */
const DESCRIBED_BY = '</llms.txt>; rel="describedby"; type="text/plain", </llms-full.txt>; rel="describedby"; type="text/markdown", </ai.txt>; rel="describedby"; type="text/plain"';

// Signed-out visitors to the dashboard go to /login (and come back afterwards via ?next=).
// Neon Auth's middleware also refreshes the session cookie. Real checks happen in the API.
let gate: ((req: NextRequest) => Promise<Response>) | null = null;

export async function proxy(req: NextRequest) {
  // Markdown versions of public pages: /<path>.md, Accept: text/markdown, or an AI agent's User-Agent.
  const path = req.nextUrl.pathname;
  const accept = req.headers.get('accept');
  const mdTarget = markdownTarget(path, accept, req.method, req.headers.get('user-agent'));
  if (mdTarget !== null) return NextResponse.rewrite(new URL(`/api/md${mdTarget === '/' ? '/index' : mdTarget}`, req.url));
  // Everything below is the sign-in gate, which only the dashboard and the auth pages go through.
  if (!/^\/(app(\/|$)|login$|signup$)/.test(path)) {
    const twin = isMarkdownPath(path);
    // A page with a markdown twin is negotiated on Accept: a client that takes neither HTML nor
    // markdown gets 406 (AEO spec §3). The app's own router requests are never negotiated.
    const appRouter = req.headers.has('rsc') || req.headers.has('next-router-state-tree');
    if (twin && !appRouter && (req.method === 'GET' || req.method === 'HEAD') && acceptsNeither(accept)) {
      return new NextResponse('406 Not Acceptable: this page is available as text/html or text/markdown.\n', { status: 406, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Vary': 'Accept', 'X-AEO-Version': AEO_VERSION } });
    }
    const res = NextResponse.next();
    // Every HTML page advertises the policy files; one with a markdown twin also names it and varies on Accept.
    const alternate = twin ? `, <${siteUrl()}${path === '/' ? '/index.md' : `${path}.md`}>; rel="alternate"; type="text/markdown"` : '';
    res.headers.set('Link', DESCRIBED_BY + alternate);
    // Next replaces Vary on page responses with its own router list, so `Accept` can't be added here (or in
    // next.config headers); the markdown responses carry it, and the agent registry serves bots by User-Agent.
    if (twin) res.headers.set('X-AEO-Version', AEO_VERSION);
    return res;
  }
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
      // Keep the query too: a shared link (/app?share=…) must still open the composer after signing in.
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      res.headers.set('location', url.toString());
    }
  }
  return res;
}

function isLoginRedirect(res: Response, req: NextRequest) {
  const location = res.headers.get('location');
  return !!location && new URL(location, req.url).pathname === '/login';
}

// The dashboard gate, plus every path that can carry a .md suffix or an Accept: text/markdown request.
export const config = { matcher: ['/app', '/app/:path*', '/login', '/signup', '/((?!api/|_next/|\\.well-known/|fonts/|brand/|logos/|icons/|images/|favicon\\.ico|robots\\.txt|sitemap\\.xml|llms\\.txt|llms-full\\.txt|ai\\.txt|manifest\\.webmanifest|opengraph-image|apple-icon|[^/]+\\.(?:png|jpg|svg|txt|xml|ico|webp|woff2)$).*)'] };
