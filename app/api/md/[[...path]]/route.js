import { listMarkdownRoutes, renderPath } from '@/lib/md/registry';
import { abs } from '@/lib/md/format';
import { markdownResponse, notFoundMarkdown, preflight } from '@/lib/md/http';

/**
 * The one markdown handler. /api/md/<path> is the markdown version of /<path>; proxy.ts rewrites
 * /<path>.md and `Accept: text/markdown` requests here. /api/md/_catalog lists every route.
 */
async function respond(ctx, head) {
  const { path = [] } = await ctx.params;
  const rel = path.join('/');
  if (rel === '_catalog') {
    const body = JSON.stringify({ site: abs('/'), generated: new Date().toISOString(), routes: listMarkdownRoutes().map((r) => ({ html: abs(r.path), markdown: abs(r.path === '/' ? '/index.md' : `${r.path}.md`), group: r.group })) }, null, 2);
    return new Response(head ? null : body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', 'Access-Control-Allow-Origin': '*', 'X-Robots-Tag': 'noindex, follow' } });
  }
  const page = renderPath(rel === 'index' ? '/' : rel);
  if (!page) return markdownResponse(notFoundMarkdown(`/${rel}`), { status: 404, head });
  const isStatic = !/^\/(blog|compare|tools)\//.test(page.path);
  return markdownResponse(page.markdown, { path: page.path, updated: page.updated, head, cache: isStatic ? 'public, s-maxage=86400, stale-while-revalidate=604800' : undefined });
}

export const GET = (_req, ctx) => respond(ctx, false);
export const HEAD = (_req, ctx) => respond(ctx, true);
export const OPTIONS = () => preflight();
