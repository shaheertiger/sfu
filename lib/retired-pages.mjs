/**
 * Pages retired in the November 2026 SEO pruning, and where their URLs go now. Plain data with no
 * imports, so next.config.mjs (redirects) and the app (lib/post-ideas.js) can both read it.
 * Why each went: see research/seo-playbook-audit-2026-11.md.
 */

/** Post-ideas industries without clear search demand: /post-ideas/{slug}(/…) → /post-ideas. */
export const RETIRED_INDUSTRIES = ['coaches', 'schools', 'lawyers', 'accountants', 'insurance-agents', 'spas', 'hotels', 'travel-agencies', 'car-dealerships', 'hvac', 'plumbers', 'roofers', 'landscapers', 'cleaning-services', 'daycares', 'veterinarians', 'pharmacies', 'authors', 'musicians', 'artists', 'podcasters', 'saas', 'agencies', 'freelancers', 'yoga-studios'];

const DAYS = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday';

/** Permanent redirects, most specific first. */
export const RETIRED_REDIRECTS = [
  // Retired industries, with or without the old weekday segment, go to the post-ideas hub.
  { source: `/post-ideas/:industry(${RETIRED_INDUSTRIES.join('|')})/:rest*`, destination: '/post-ideas' },
  // Industry × weekday pages repeated 70–74% of their text; the industry page now has the weekly plan.
  { source: `/post-ideas/:industry/:day(${DAYS})`, destination: '/post-ideas/:industry#days' },
  // Platform × weekday pages repeated the hub's answer and text; the hub has the by-day table.
  { source: `/best-time-to-post/:platform/:day(${DAYS})`, destination: '/best-time-to-post/:platform#by-day' },
  // Two pages for one query: the list page owns "buffer alternative".
  { source: '/buffer-alternative', destination: '/best-buffer-alternatives' },
  // YouTube and X have channels and accounts, not "pages": one name generator per platform.
  { source: '/tools/youtube-page-name-generator', destination: '/tools/youtube-name-generator' },
  { source: '/tools/x-page-name-generator', destination: '/tools/x-name-generator' },
];
