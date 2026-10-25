import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROUTES, SKIPPED, listMarkdownRoutes, renderPath, resolve } from '../lib/md/registry.js';
import { PRIVATE_PATHS, ROBOTS_DISALLOW } from '../lib/md/identity.js';
import { markdownResponse, notFoundMarkdown } from '../lib/md/http.js';

const APP = path.join(process.cwd(), 'app');

/** Public HTML routes from the app folder: every page.jsx, as a route pattern. */
function pageRoutes() {
  const out: string[] = [];
  const walk = (dir: string, rel: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        if (ent.name === 'api') continue;
        const seg = /^\(.*\)$/.test(ent.name) ? '' : `/${ent.name}`;
        walk(path.join(dir, ent.name), rel + seg);
      } else if (/^page\.(jsx|tsx|js)$/.test(ent.name)) out.push(rel || '/');
    }
  };
  walk(APP, '');
  return out;
}

test('every public page has a markdown renderer or a reason on the skip list', () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  const patterns = new Set(ROUTES.map((r) => r.path || r.pattern));
  for (const route of pageRoutes()) {
    const skipped = Object.keys(SKIPPED).some((s) => route === s || route.startsWith(`${s}/`));
    assert.ok(patterns.has(route) || skipped, `${route} has no markdown renderer and is not on the skip list (lib/md/registry.js)`);
  }
});

test('markdown pages carry the header, absolute links and the same facts as the HTML', () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  const home = renderPath('/')!;
  assert.match(home.markdown, /^# Schedule For You/);
  assert.match(home.markdown, /\nCanonical: https:\/\/scheduleforyou\.com\/\n/);
  assert.match(home.markdown, /\| Solo \| \$19 \| \$190 \| 15 \|/);
  const pricing = renderPath('/pricing')!;
  assert.match(pricing.markdown, /### How does the referral program work\?/);
  assert.doesNotMatch(pricing.markdown, /\]\(\//, 'relative links must be absolute');
  assert.doesNotMatch(pricing.markdown, /<!-- cta -->/);
  const post = listMarkdownRoutes().find((r) => r.pattern === '/blog/[slug]')!;
  const article = renderPath(post.path)!;
  assert.match(article.markdown, /\nLast updated: \d{4}-\d{2}-\d{2}\n/);
  const platform = renderPath('/instagram')!;
  assert.match(platform.markdown, /## Instagram at a glance\n\n\| What \| Detail \|/);
  const docs = renderPath('/docs')!;
  assert.match(docs.markdown, /### List accounts\n\n`GET https:\/\/scheduleforyou\.com\/api\/v1\/accounts`/);
  const tool = listMarkdownRoutes().find((r) => r.pattern === '/tools/[slug]')!;
  assert.match(renderPath(tool.path)!.markdown, /runs in the browser/);
});

test('private, skipped and unknown paths have no markdown version', () => {
  for (const p of ['/app', '/app/automations', '/login', '/signup', '/demo', '/p/abc', '/c/abc', '/does-not-exist', '/blog/not-a-post', '/compare/x/y', '/tools/no-such-tool']) {
    assert.equal(resolve(p), null, p);
    assert.equal(renderPath(p), null, p);
  }
  assert.match(notFoundMarkdown('/nope'), /^# Not found/);
});

test('the catalog lists every route once and the policy files agree on private paths', () => {
  const routes = listMarkdownRoutes();
  assert.equal(new Set(routes.map((r) => r.path)).size, routes.length);
  assert.ok(routes.length > 150, `only ${routes.length} routes`);
  for (const p of ROBOTS_DISALLOW) assert.ok(PRIVATE_PATHS.includes(p), `${p} in robots but not ai.txt`);
  for (const [p] of Object.entries(SKIPPED)) assert.ok(!routes.some((r) => r.path === p || r.path.startsWith(`${p}/`)), `${p} is skipped but listed`);
});

test('markdown responses carry the agent headers; HEAD has no body', async () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  const res = markdownResponse('# Hi\n\nfour chars', { path: '/pricing', updated: '2026-10-20' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(res.headers.get('x-markdown-tokens'), String(Math.ceil('# Hi\n\nfour chars'.length / 4)));
  assert.equal(res.headers.get('x-robots-tag'), 'noindex, follow');
  assert.equal(res.headers.get('content-location'), 'https://scheduleforyou.com/pricing');
  assert.equal(res.headers.get('link'), '<https://scheduleforyou.com/pricing>; rel="canonical"');
  assert.equal(res.headers.get('vary'), 'Accept');
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.match(res.headers.get('last-modified')!, /2026/);
  const head = markdownResponse('body', { path: '/pricing', head: true });
  assert.equal(await head.text(), '');
  const nf = markdownResponse(notFoundMarkdown('/x'), { status: 404 });
  assert.equal(nf.status, 404);
  assert.equal(nf.headers.get('cache-control'), 'no-store');
});

test('Accept negotiation: only an explicit text/markdown preference wins', async () => {
  const { wantsMarkdown, markdownTarget } = await import('../lib/md/negotiate.js');
  assert.equal(wantsMarkdown(null), false);
  assert.equal(wantsMarkdown('*/*'), false);
  assert.equal(wantsMarkdown('text/html,application/xhtml+xml,*/*;q=0.8'), false);
  assert.equal(wantsMarkdown('text/markdown'), true);
  assert.equal(wantsMarkdown('text/markdown;q=0.9, text/html;q=0.8'), true);
  assert.equal(wantsMarkdown('text/html, text/markdown;q=0.5'), false);
  assert.equal(wantsMarkdown('text/markdown;q=0'), false);
  process.env.APP_URL = 'https://scheduleforyou.com';
  assert.equal(markdownTarget('/pricing.md', null), '/pricing');
  assert.equal(markdownTarget('/index.md', null), '/');
  assert.equal(markdownTarget('/nope.md', null), '/nope', 'unknown .md still goes to the markdown 404');
  assert.equal(markdownTarget('/pricing', 'text/markdown'), '/pricing');
  assert.equal(markdownTarget('/pricing', '*/*'), null);
  assert.equal(markdownTarget('/login', 'text/markdown'), null, 'skipped pages never negotiate');
  assert.equal(markdownTarget('/pricing', 'text/markdown', 'POST'), null);
  for (const p of ['/api/md/x.md', '/llms.txt', '/robots.txt', '/sitemap.xml', '/_next/static/a.md', '/.well-known/mcp.json']) assert.equal(markdownTarget(p, 'text/markdown'), null, p);
});
