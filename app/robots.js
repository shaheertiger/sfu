import { siteUrl } from '@/lib/site';
import { ROBOTS_DISALLOW } from '@/lib/md/identity';

/**
 * Public pages may be indexed; the signed-in app, API, preview and invite links may not.
 * AI search and user-fetch crawlers are allowed explicitly: they decide whether answer engines can
 * cite us. Training crawlers (GPTBot, ClaudeBot, Google-Extended, …) are allowed too, by choice.
 * Keep the private paths in sync with /ai.txt and /llms.txt (lib/md/identity.js). Markdown versions
 * (/<page>.md) are noindex alternates and stay out of the sitemap on purpose.
 */
const DISALLOW = ROBOTS_DISALLOW;
const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
