import { siteUrl } from '@/lib/site';
import { robotsDisallowRules } from '@/lib/md/identity';

export const dynamic = 'force-static';

/**
 * robots.txt as a route handler (the metadata route can't carry comments). Public pages may be
 * indexed; the signed-in app, API, preview and invite links may not. AI search and user-fetch
 * crawlers are allowed explicitly: they decide whether answer engines can cite us. Training
 * crawlers (GPTBot, ClaudeBot, Google-Extended, …) are allowed too, by choice. Markdown versions
 * (/<page>.md) are noindex alternates and stay out of the sitemap on purpose.
 *
 * Search engines skip the markdown versions: every HTML page links to its twin, and Googlebot was
 * spending its crawl on the twins (which can never be indexed) while real pages waited in
 * "Discovered - currently not indexed". AI crawlers fall under `*` or their own group and keep them.
 */
const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
/** Web search crawlers. A crawler obeys only its own group, so each repeats the shared rules. */
const SEARCH_ENGINE_BOTS = ['Googlebot', 'Bingbot'];
const MARKDOWN_TWINS = '/*.md$';

function build() {
  const base = siteUrl();
  const rules = (agent, extra = []) => [`User-Agent: ${agent}`, 'Allow: /', ...[...robotsDisallowRules(), ...extra].map((p) => `Disallow: ${p}`), ''];
  return [
    '# robots.txt for scheduleforyou.com. Keep in sync with /llms.txt and /ai.txt (lib/md/identity.js).',
    `# Site map for language models: ${base}/llms.txt`,
    `# AI usage policy: ${base}/ai.txt`,
    '# AI search and user-fetch crawlers are allowed on every public page; training crawlers are allowed too.',
    '',
    ...rules('*'),
    '# Search engines: skip the markdown twins (noindex copies of each page) so crawl goes to the HTML pages.',
    ...SEARCH_ENGINE_BOTS.flatMap((a) => rules(a, [MARKDOWN_TWINS])),
    ...AI_SEARCH_BOTS.map((a) => rules(a)).flat(),
    `Host: ${base}`,
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}

export const GET = () => new Response(build(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
