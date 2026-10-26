import { listMarkdownRoutes, renderPath } from '@/lib/md/registry';
import { abs } from '@/lib/md/format';
import { preflight, textResponse } from '@/lib/md/http';
import { SITE_NAME } from '@/lib/seo';
import { buildAgentGuide } from '@/lib/md/agent-guide';

export const dynamic = 'force-static';
export const revalidate = 86400;

/** How many of each large collection go in; the rest are reachable from the listing pages. */
const CAPS = { tools: 10, blog: 12, compare: 8 };
const ORDER = ['core', 'docs', 'tools', 'blog', 'compare', 'legal'];
const MAX_CHARS = 500_000;

/**
 * The guide for assistants (facts, which page answers what, API and MCP, every URL), then the
 * main pages from llms.txt rendered with the same registry and joined. Cached a day.
 */
function build() {
  const routes = listMarkdownRoutes();
  const parts = [];
  for (const g of ORDER) {
    const list = routes.filter((r) => r.group === g);
    const cap = CAPS[g];
    const take = cap ? [...list.filter((r) => !r.params), ...list.filter((r) => r.params).slice(0, cap)] : list;
    for (const r of take) {
      const page = renderPath(r.path);
      if (page) parts.push(`---\n<!-- source: ${abs(r.path)} -->\n${page.markdown.trim()}`);
    }
    if (cap && list.length > take.length) parts.push(`---\n<!-- ${list.length - take.length} more ${g} pages: see ${abs(`/${g === 'tools' ? 'tools' : g}`)}.md -->`);
  }
  const text = [buildAgentGuide(), '', '---', '', `# ${SITE_NAME} - full page content`, '', ...parts, ''].join('\n');
  if (text.length > MAX_CHARS) console.warn(`[llms-full] ${text.length} chars, over the ${MAX_CHARS} target; lower CAPS in app/llms-full.txt/route.js`);
  return text;
}

export const GET = () => textResponse(build(), { type: 'text/markdown; charset=utf-8' });
export const HEAD = () => textResponse(build(), { head: true, type: 'text/markdown; charset=utf-8' });
export const OPTIONS = () => preflight();
