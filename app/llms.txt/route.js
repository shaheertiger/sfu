import { listMarkdownRoutes, renderPath } from '@/lib/md/registry';
import { abs } from '@/lib/md/format';
import { preflight, textResponse } from '@/lib/md/http';
import { DESCRIPTION, FREE, PLANS, SITE_NAME } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/md/identity';

export const dynamic = 'force-static';
export const revalidate = 86400;

const md = (p) => abs(p === '/' ? '/index.md' : `${p}.md`);
const CAP = 50;

/** llms.txt (llmstxt.org): a map of the site for language models. Keep in sync with /ai.txt and /robots.txt. */
function build() {
  const routes = listMarkdownRoutes();
  const line = (r) => {
    const page = renderPath(r.path);
    return `- [${page?.title || r.name}](${md(r.path)}): ${(page?.summary || '').replace(/\s+/g, ' ').trim()}`;
  };
  const group = (g) => routes.filter((r) => r.group === g);
  const capped = (g, listPath) => {
    const list = group(g).filter((r) => r.path !== listPath);
    return [...list.slice(0, CAP).map(line), ...(list.length > CAP ? [`- ${list.length - CAP} more: see [the full list](${md(listPath)})`] : [])];
  };
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${DESCRIPTION} It is for creators, small businesses and agencies that post to several platforms and want one queue, per-platform captions, approvals and a REST API instead of a suite of tools.`,
    '',
    `Plans: Free ($0, ${FREE.accounts} connected accounts, up to ${FREE.queue} scheduled posts at a time, no card; posts end with a short link back to Schedule For You when it fits), ${PLANS.map((p) => `${p.name} $${p.price}/month (${p.accounts} connected accounts, unlimited posts)`).join(', ')}; yearly billing is 10 months. Bulk scheduling, approvals, RSS, webhooks, the REST API and the MCP server are on the paid plans, which start with a 7-day free trial with a card. Contact: ${CONTACT_EMAIL}.`,
    `Keep this file in sync with ${abs('/ai.txt')} and ${abs('/robots.txt')}.`,
    '',
    '## Core pages',
    ...group('core').map(line),
    '',
    '## Docs',
    ...group('docs').map(line),
    '',
    '## Free tools',
    line(routes.find((r) => r.path === '/tools')),
    ...capped('tools', '/tools'),
    '',
    '## Guides',
    line(routes.find((r) => r.path === '/blog')),
    ...capped('blog', '/blog'),
    '',
    '## Comparisons',
    line(routes.find((r) => r.path === '/compare')),
    ...capped('compare', '/compare'),
    '',
    '## Other languages',
    'Translated tool and scheduler pages for German, French, Japanese and Dutch searchers. The dashboard itself is in English.',
    ...group('i18n').map(line),
    '',
    '## Machine-readable',
    `- [Full content](${abs('/llms-full.txt')}): every page in one file`,
    `- [Markdown catalog](${abs('/api/md/_catalog')}): JSON list of every markdown route`,
    `- [Sitemap](${abs('/sitemap.xml')})`,
    `- [AI usage policy](${abs('/ai.txt')})`,
    `- [MCP server](${abs('/.well-known/mcp.json')}): discovery for the Model Context Protocol server at ${abs('/api/mcp')}`,
    '',
    '## Optional',
    ...group('legal').map(line),
    '',
  ].join('\n');
}

export const GET = () => textResponse(build());
export const HEAD = () => textResponse(build(), { head: true });
export const OPTIONS = () => preflight();
