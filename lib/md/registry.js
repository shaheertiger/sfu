import { getComparisons, getLocalizedPages, getPosts, getToolPages, rawContent, rawLocalizedContent, FAQ_HEADING, plainText } from '../content';
import { LOCALE_CODES, localeData, pageString } from '../i18n';
import { basePath, hasTwin, localizedPage } from '../i18n-pages';
import { DESCRIPTION, FAQ, PLANS, PLATFORMS, SITE_NAME, TAGLINE } from '../seo';
import { LANDING_PAGES } from '../landing-pages';
import { PLATFORM_PAGES } from '../platform-pages';
import { CATEGORIES, TOOLS } from '../tools/registry';
import { BASE_URL, DASHBOARD_ONLY, ERRORS, GROUPS, LIMITS, WEBHOOK_EVENTS } from '../api-reference';
import { abs, bullets, cleanBody, faq, header, link, related, table } from './format';

/**
 * Every public page's markdown version. One entry per route pattern: static pages have a fixed
 * `path`; dynamic ones have a `pattern` with [params] and a `list()` of real instances. Adding a page
 * means adding one entry here; llms.txt, llms-full.txt and /api/md/_catalog follow.
 *
 * Each entry: { path | pattern, group, list?, render(params) → { title, summary, updated?, body } }.
 * Groups order llms.txt and llms-full.txt: core → docs → tools → blog → compare → i18n → legal.
 */

/** Public routes with no markdown version, each with the reason, checked by tests/markdown-site.test.ts. */
export const SKIPPED = {
  '/signup': 'account form',
  '/login': 'account form',
  '/forgot-password': 'account form',
  '/reset-password': 'account form',
  '/demo': 'interactive demo of the dashboard with sample data',
  '/brand': 'logo downloads, no prose',
  '/app': 'signed-in dashboard',
  '/p': 'private preview links',
  '/c': 'private shared calendars',
  '/invite': 'private invitations',
};

const platformNames = PLATFORMS.join(', ');

const home = () => ({
  title: `${SITE_NAME}: social media scheduler for ten platforms`,
  summary: DESCRIPTION,
  body: [
    `## ${TAGLINE}`,
    '',
    `${SITE_NAME} is a social media scheduler. Write one post, tailor the caption per platform, and publish to ${platformNames} from one queue. Every post can be scheduled, added to the next open posting slot, saved as a draft, repeated weekly or monthly, or sent for approval first.`,
    '',
    '## Platforms',
    '',
    bullets(PLATFORM_PAGES.map((p) => link(p.name, `/${p.slug}`))),
    '',
    '## Plans',
    '',
    'Both plans include unlimited posts, every platform, the queue and calendar, bulk CSV scheduling, approvals, client preview links, a media library, RSS auto-posting, webhooks, the REST API and the MCP server. A 7-day free trial needs a card; the first charge is on day 8.',
    '',
    table(['Plan', 'Monthly', 'Yearly (2 months free)', 'Connected accounts', 'Team members'], PLANS.map((p) => [p.name, `$${p.price}`, `$${p.yearly}`, String(p.accounts), p.id === 'studio' ? 'Yes' : 'No'])),
    '',
    `Full details: ${link('Pricing', '/pricing')}.`,
    '',
    `## ${FAQ_HEADING}`,
    '',
    faq(FAQ),
  ].join('\n') + related([['Pricing', '/pricing'], ['Free social media tools', '/tools'], ['Guides', '/blog'], ['API reference', '/docs']]),
});

/** A content/pages or content/platforms file, with its FAQ and CTA left as the source has them. */
function contentFile(dir, slug, extra = '') {
  const c = rawContent(dir, slug);
  if (!c) return null;
  return { title: c.data.title || c.data.h1 || slug, summary: c.data.description || c.data.lead || '', updated: c.data.updated || c.data.date, body: `${c.data.lead ? `${c.data.lead}\n\n` : ''}${extra}${cleanBody(c.body)}` };
}

const platform = ({ platform: slug }) => {
  const meta = PLATFORM_PAGES.find((p) => p.slug === slug);
  if (!meta) return null;
  const specs = meta.specs?.length ? `## ${meta.name} at a glance\n\n${table(['What', 'Detail'], meta.specs)}\n\n` : '';
  const page = contentFile('platforms', slug, specs);
  return page && { ...page, body: page.body + related([['Pricing', '/pricing'], ['All platforms', '/']]) };
};

const article = (dir) => (params) => {
  const slug = dir === 'compare' ? `${params.a}-vs-${params.b}` : params.slug;
  const c = rawContent(dir, slug);
  if (!c) return null;
  const meta = dir === 'compare' ? `Comparison of ${c.data.a} and ${c.data.b}. ` : c.data.category ? `Category: ${c.data.category}. ` : '';
  return { title: c.data.title || c.data.h1 || slug, summary: c.data.description || c.data.excerpt || '', updated: c.data.updated || c.data.date, body: `${meta ? `${meta}\n\n` : ''}${cleanBody(c.body)}${related([['All guides', '/blog'], ['Pricing', '/pricing']])}` };
};

const blogIndex = () => {
  const posts = getPosts();
  const cats = [...new Set(posts.map((p) => p.category))];
  return {
    title: 'Social media guides and how-tos',
    summary: 'Practical social media guides: image and video sizes, when to post, Instagram, TikTok, Facebook and LinkedIn how-tos, and tool comparisons.',
    updated: posts.reduce((d, p) => (p.date > d ? p.date : d), ''),
    body: cats.map((c) => `## ${c}\n\n${bullets(posts.filter((p) => p.category === c).map((p) => `${link(p.title, `/blog/${p.slug}`)} - ${plainText(p.excerpt || p.description || '')}`))}`).join('\n\n') + `\n\n## Comparisons\n\nSee ${link('all comparisons', '/compare')}.`,
  };
};

const compareIndex = () => {
  const list = getComparisons();
  return {
    title: 'Social media scheduler comparisons',
    summary: 'Side-by-side comparisons of social media scheduling tools: features, pricing and supported platforms.',
    updated: list.reduce((d, p) => (p.date > d ? p.date : d), ''),
    body: bullets(list.map((c) => `${link(c.title, `/compare/${c.aSlug}/${c.bSlug}`)} - ${plainText(c.excerpt || c.description || '')}`)),
  };
};

const toolsIndex = () => {
  const pages = getToolPages();
  return {
    title: 'Free social media tools: fonts, counters, resizers and more',
    summary: 'Free social media tools that run in the browser: font and bold text generators, character counters, photo resizers, and name, bio and comment ideas. No sign-up.',
    body: CATEGORIES.map((c) => {
      const list = TOOLS.filter((t) => t.category === c.id).map((t) => ({ t, p: pages.find((p) => p.slug === t.slug) })).filter((x) => x.p);
      return list.length ? `## ${c.name}\n\n${c.blurb}\n\n${bullets(list.map(({ t, p }) => `${link(p.h1 || p.title, `/tools/${t.slug}`)} - ${plainText(p.lead || p.description || '')}`))}` : '';
    }).filter(Boolean).join('\n\n'),
  };
};

const KIND_NOTE = {
  font: 'a Unicode font generator', counter: 'a character counter', linebreak: 'a line-break formatter', resizer: 'an image resizer', logo: 'a simple logo maker',
  name: 'a name idea generator', handle: 'a handle checker', bio: 'a bio generator', comment: 'a comment idea generator', caption: 'a caption idea generator',
  linkedin: 'a LinkedIn text formatter', slice: 'an image splitter', unfollowers: 'an unfollowers checker (runs on your own export)', yttags: 'a YouTube tag generator', yttitle: 'a YouTube title checker', shadowban: 'a guided shadowban self-test (it asks questions; it does not query any platform)',
};

const tool = ({ slug }) => {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) return null;
  const note = `This page has ${KIND_NOTE[t.kind] || 'an interactive tool'} that runs in the browser; use the HTML page to run it. The text below is the guide that goes with it.\n\n`;
  const page = contentFile('tools', slug, note);
  return page && { ...page, body: page.body + related([['All free tools', '/tools'], ['Schedule posts with Schedule For You', '/']]) };
};

const docs = () => {
  const endpoint = (e) => {
    const params = [...(e.params?.path || []).map((p) => ['path', p]), ...(e.params?.query || []).map((p) => ['query', p]), ...(e.params?.body || []).map((p) => ['body', p])];
    return [
      `### ${e.title}`, '', `\`${e.method} ${BASE_URL}${e.path}\``, '', ...(e.description || []), '',
      ...(params.length ? [table(['Where', 'Field', 'Type', 'Required', 'Description'], params.map(([w, p]) => [w, `\`${p.name}\``, p.type || '', p.required ? 'yes' : '', p.description || ''])), ''] : []),
      ...(e.example?.body ? ['Example request body:', '', '```json', JSON.stringify(e.example.body, null, 2), '```', ''] : []),
      ...(e.response ? [`Response (${e.response.status}):`, '', '```json', JSON.stringify(e.response.body, null, 2), '```', ''] : []),
      ...(e.errors?.length ? [bullets(e.errors.map(([c, w]) => `${c}: ${w}`)), ''] : []),
    ].join('\n');
  };
  return {
    title: `${SITE_NAME} API reference: posts, media and webhooks`,
    summary: `Reference for the ${SITE_NAME} REST API: authenticate with an API key, create and schedule posts, upload media, manage RSS feeds and verify webhooks.`,
    body: [
      '## Introduction', '', `Base URL: \`${BASE_URL}\`. Every workspace includes the API on both plans. Requests and responses are JSON. Times are ISO 8601 or epoch milliseconds.`, '',
      '## Authentication', '', 'Create an API key in the dashboard under Settings. Send it on every request as `Authorization: Bearer <key>`. A key belongs to one workspace.', '',
      '## Errors', '', table(['Status', 'Meaning', 'When'], ERRORS), '',
      '## Limits', '', table(['What', 'Limit'], LIMITS), '',
      ...GROUPS.flatMap((g) => [`## ${g.title}`, '', ...(g.intro || []), '', ...g.endpoints.map(endpoint)]),
      '## Dashboard-only actions', '', bullets(DASHBOARD_ONLY.map((d) => `\`${d.method} ${d.path}\`: ${d.what}`)), '',
      '## Webhook events', '', table(['Event', 'Sent when'], WEBHOOK_EVENTS), '',
      '## MCP server', '', `The MCP server lives at ${abs('/api/mcp')} and takes the same API key. See the HTML reference for the tool list and client setup.`,
    ].join('\n') + related([['API overview', '/api'], ['Pricing', '/pricing']]),
  };
};

const landing = (slug) => () => contentFile('pages', slug);

/** A localized tool or platform page, in its own language, pointing back to the English original. */
const localized = (locale, kind) => (params) => {
  const slug = kind === 'platforms' ? params.platform : params.slug;
  if (!localizedPage(locale, kind, slug)) return null;
  const c = rawLocalizedContent(locale, kind, slug);
  const meta = kind === 'platforms' ? PLATFORM_PAGES.find((p) => p.slug === slug) : null;
  const specs = meta ? localeData(locale).specs?.[slug] || meta.specs : null;
  const specTable = specs ? `## ${pageString(locale, 'atAGlance', { name: meta.name })}\n\n${table(['', ''], specs)}\n\n` : '';
  const english = hasTwin(kind, slug) ? ` English version: ${link(basePath(kind, slug), basePath(kind, slug))}.` : '';
  const note = `Language: ${localeData(locale).name} (${locale}).${english}\n\n`;
  const intro = c.data.lead || c.data.excerpt;
  return {
    title: c.data.title || c.data.h1 || slug,
    summary: c.data.description || c.data.lead || '',
    updated: c.data.updated || c.data.date,
    body: `${note}${intro ? `${intro}\n\n` : ''}${specTable}${cleanBody(c.body)}`,
  };
};

/** Markdown routes for every localized page, one pair of patterns per language. */
const localizedRoutes = () =>
  LOCALE_CODES.flatMap((locale) => [
    { pattern: `/${locale}/[platform]`, group: 'i18n', name: `Platform pages (${localeData(locale).name})`, list: () => PLATFORM_PAGES.filter((p) => localizedPage(locale, 'platforms', p.slug)).map((p) => ({ platform: p.slug })), render: localized(locale, 'platforms') },
    { pattern: `/${locale}/tools/[slug]`, group: 'i18n', name: `Free tool pages (${localeData(locale).name})`, list: () => TOOLS.filter((t) => localizedPage(locale, 'tools', t.slug)).map((t) => ({ slug: t.slug })), render: localized(locale, 'tools') },
    { pattern: `/${locale}/blog/[slug]`, group: 'i18n', name: `Guides (${localeData(locale).name})`, list: () => getLocalizedPages(locale, 'blog').map((p) => ({ slug: p.slug })), render: localized(locale, 'blog') },
  ]);

/** @type {{ path?: string, pattern?: string, group: string, name: string, list?: () => Record<string, string>[], render: (params: any) => any }[]} */
export const ROUTES = [
  { path: '/', group: 'core', name: 'Home', render: home },
  { path: '/pricing', group: 'core', name: 'Pricing', render: landing('pricing') },
  { path: '/api', group: 'core', name: 'API overview', render: landing('api') },
  { path: '/about', group: 'core', name: 'About', render: landing('about') },
  ...LANDING_PAGES.filter((p) => !['pricing', 'api', 'privacy', 'data-deletion'].includes(p.slug)).map((p) => ({ path: `/${p.slug}`, group: 'core', name: p.name, render: landing(p.slug) })),
  { pattern: '/[platform]', group: 'core', name: 'Platform pages', list: () => PLATFORM_PAGES.map((p) => ({ platform: p.slug })), render: platform },
  { path: '/docs', group: 'docs', name: 'API reference', render: docs },
  { path: '/tools', group: 'tools', name: 'Free tools', render: toolsIndex },
  { pattern: '/tools/[slug]', group: 'tools', name: 'Free tool pages', list: () => TOOLS.filter((t) => getToolPages().some((p) => p.slug === t.slug)).map((t) => ({ slug: t.slug })), render: tool },
  { path: '/blog', group: 'blog', name: 'Guides', render: blogIndex },
  { pattern: '/blog/[slug]', group: 'blog', name: 'Guides', list: () => getPosts().map((p) => ({ slug: p.slug })), render: article('blog') },
  { path: '/compare', group: 'compare', name: 'Comparisons', render: compareIndex },
  { pattern: '/compare/[a]/[b]', group: 'compare', name: 'Comparisons', list: () => getComparisons().map((c) => ({ a: c.aSlug, b: c.bSlug })), render: article('compare') },
  ...localizedRoutes(),
  { path: '/privacy', group: 'legal', name: 'Privacy policy', render: landing('privacy') },
  { path: '/data-deletion', group: 'legal', name: 'Data deletion', render: landing('data-deletion') },
];

const fill = (pattern, params) => pattern.replace(/\[(\w+)\]/g, (_, k) => params[k]);

/** Every addressable markdown route, in llms.txt order: { path, group, name, title?, summary? }. */
export function listMarkdownRoutes() {
  const out = [];
  for (const r of ROUTES) {
    if (r.path) out.push({ path: r.path, group: r.group, name: r.name, pattern: r.path });
    else for (const params of r.list()) out.push({ path: fill(r.pattern, params), group: r.group, name: r.name, pattern: r.pattern, params });
  }
  return out;
}

/** The page for an HTML path, or null when the path has no markdown version. */
export function resolve(path) {
  const clean = path === '' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  if (clean !== '/' && Object.keys(SKIPPED).some((s) => clean === s || clean.startsWith(`${s}/`))) return null;
  // Fixed paths first (/docs must not be read as the platform page "docs"), then patterns whose instance exists.
  const fixed = ROUTES.find((r) => r.path === clean);
  if (fixed) return { route: fixed, params: {} };
  for (const r of ROUTES) {
    if (!r.pattern) continue;
    const keys = [...r.pattern.matchAll(/\[(\w+)\]/g)].map((m) => m[1]);
    const re = new RegExp(`^${r.pattern.replace(/\[\w+\]/g, '([^/]+)')}$`);
    const m = re.exec(clean);
    if (!m) continue;
    const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    if (r.list().some((p) => keys.every((k) => p[k] === params[k]))) return { route: r, params };
  }
  return null;
}

/** Full markdown document for an HTML path, or null. */
export function renderPath(path) {
  const hit = resolve(path);
  if (!hit) return null;
  const page = hit.route.render(hit.params);
  if (!page) return null;
  const canonical = path === '' || path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return { ...page, path: canonical, markdown: `${header({ title: page.title, summary: page.summary, path: canonical, updated: page.updated })}\n${page.body.trim()}\n` };
}

/** Which HTML paths take `Accept: text/markdown` negotiation and the `.md` suffix (the allowlist proxy.ts uses). */
export const isMarkdownPath = (path) => resolve(path) !== null;
