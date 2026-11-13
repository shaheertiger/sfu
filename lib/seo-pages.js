import { siteUrl } from './site';
import { SITE_NAME, organizationLd, snippet } from './seo';

/**
 * Structured data for the tools, blog and comparison pages. Everything here mirrors what the page
 * shows: the breadcrumb trail, the FAQ text and the article headline.
 */

export const abs = (p) => `${siteUrl()}${p === '/' ? '/' : p}`;

/** ItemList of the pages a hub links to: [{ name, path }]. */
export const itemListLd = (name, items) => ({
  '@type': 'ItemList', name, numberOfItems: items.length,
  itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, url: abs(x.path) })),
});

/** Dataset for a page whose core is a table of measured or verified values (sizes, limits). */
export const datasetLd = ({ name, description, path, dateModified, variables = [] }) => ({
  '@type': 'Dataset', '@id': `${abs(path)}#dataset`, name, description, url: abs(path), ...(dateModified ? { dateModified } : {}),
  isAccessibleForFree: true, creator: { '@id': `${siteUrl()}/#organization` },
  ...(variables.length ? { variableMeasured: variables } : {}),
});

export function breadcrumbLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.href) })),
  };
}

const strip = (s) => String(s).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]+/g, '').replace(/\s+/g, ' ').trim();

export function faqPageLd(faq) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
  };
}

const publisher = () => ({ '@id': `${siteUrl()}/#organization` });

/**
 * HowTo from a tool page's "How to use…" section, whose steps are H3s followed by a sentence or two.
 * null when the section is missing or has fewer than two steps.
 */
export function howToLd(page, url) {
  const section = (page.sections || []).find((s) => /^how to\b/i.test(s.heading));
  if (!section) return null;
  const steps = [...String(section.body).matchAll(/^### (.+)\n+([^#\n!][^\n]*)/gm)].map((m, i) => ({
    '@type': 'HowToStep', position: i + 1, name: m[1].trim(), text: m[2].replace(/\*\*|\[([^\]]+)\]\([^)]*\)/g, '$1').trim(), url: `${url}#${section.id}`,
  }));
  return steps.length >= 2 ? { '@type': 'HowTo', '@id': `${url}#howto`, name: section.heading, step: steps } : null;
}

export function toolPageLd({ page, path, crumbs, lang = 'en' }) {
  const url = abs(path);
  const graph = [
    organizationLd(),
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${siteUrl()}/#website` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: lang,
    },
    {
      '@type': 'WebApplication',
      name: page.h1,
      url,
      description: page.description,
      inLanguage: lang,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      publisher: publisher(),
    },
    { ...breadcrumbLd(crumbs), '@id': `${url}#breadcrumb` },
  ];
  const howTo = howToLd(page, url);
  if (howTo) graph.push(howTo);
  if (page.faq?.length) graph.push(faqPageLd(page.faq));
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function articleLd({ post, path, crumbs, lang = 'en' }) {
  const url = abs(path);
  const graph = [
    organizationLd(),
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: post.h1,
      description: post.description,
      url,
      mainEntityOfPage: url,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      wordCount: post.words,
      articleSection: post.category,
      inLanguage: lang,
      image: abs(post.hero || '/opengraph-image'),
      author: { '@type': 'Organization', name: `${SITE_NAME} team`, url: abs('/') },
      publisher: publisher(),
    },
    breadcrumbLd(crumbs),
  ];
  if (post.listItems?.length >= 3) graph.push(listItemsLd(post));
  if (post.faq?.length) graph.push(faqPageLd(post.faq));
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** ItemList of the tools a "best X" page reviews, in page order (names only: the page has no per-tool URLs). */
export const listItemsLd = (post) => ({
  '@type': 'ItemList', name: post.h1, numberOfItems: post.listItems.length,
  itemListElement: post.listItems.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
});

export function collectionLd({ name, description, path, crumbs, items }) {
  const url = abs(path);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(),
      {
        '@type': 'CollectionPage',
        url,
        name,
        description,
        isPartOf: { '@id': `${siteUrl()}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(it.href), name: it.name })),
        },
      },
      breadcrumbLd(crumbs),
    ],
  };
}

const SHARE_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'Schedule For You: write it once, post it everywhere.' };

/**
 * Metadata for a public content page. Setting `openGraph` on a page replaces the root one, so the
 * share image is listed again here. `absolute` skips the "· Schedule For You" title suffix.
 */
/** Hand-written `ai-summary` lines for the key pages; every other page uses its description. */
export const AI_SUMMARIES = {
  '/': 'Schedule For You is a social media scheduler (Free for 3 accounts and 10 scheduled posts at a time; Solo $19/month, Studio $59/month, with a 7-day trial) that publishes one post to X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook and Pinterest (Google Business Profile coming soon) with per-platform captions, a queue, approvals, a media library, a REST API and an MCP server.',
  '/pricing': 'Three plans: Free for 3 connected accounts and up to 10 scheduled posts at a time with no card (posts carry a short link back to Schedule For You); Solo at $19/month for 15 accounts and Studio at $59/month for 100 accounts plus team members, both with unlimited posts, bulk scheduling, approvals, RSS, webhooks and the API; yearly billing costs 10 months; the paid plans start with a 7-day free trial with a card; a referral program gives the referrer a free month when a referred workspace pays.',
  '/blog': 'An index of practical social media guides grouped by platform (Instagram, YouTube, TikTok, Facebook, X, LinkedIn and more) plus scheduling-tool comparisons, all written by Schedule For You.',
  '/tools': 'A directory of free browser-based social media tools from Schedule For You: font and bold text generators, character counters, photo resizers, grid and carousel splitters, and name, bio and comment idea generators; no sign-up and nothing uploaded.',
  '/docs': 'Reference for the Schedule For You REST API (base URL https://scheduleforyou.com/api/v1, bearer API keys): accounts, posts, media uploads, RSS feeds, webhooks with signed payloads, calendar links, automations, and the hosted MCP server.',
};

/** The markdown version of a page (served by lib/md) and the AI summary agents read, for any page metadata. */
export function agentMetadata(path, description, aiSummary) {
  return {
    alternates: { types: { 'text/markdown': `${siteUrl()}${path === '/' ? '/index.md' : `${path}.md`}` } },
    other: { 'ai-summary': aiSummary || AI_SUMMARIES[path] || description },
  };
}

/**
 * `languages` is the hreflang map ({ en: '/tools/x', de: '/de/tools/x', 'x-default': '/tools/x' }) for
 * pages that exist in more than one language; `locale` is the page's own og:locale.
 */
export function pageMetadata({ title, description, path, type = 'website', absolute = false, keyword, keywords, publishedTime, section, aiSummary, languages, locale, image }) {
  const agent = agentMetadata(path, description, aiSummary);
  const words = [keyword, ...(keywords || [])].filter(Boolean);
  // The " · Schedule For You" suffix only when the whole title still fits in a search result (~65
  // characters); a longer title keeps its own words instead of being cut off at the brand.
  const branded = !absolute && `${title} · ${SITE_NAME}`.length <= 65;
  // A page's own hero card (1200 × 675, named with its size) makes a better share image than the generic one.
  const size = image && /-(\d+)x(\d+)\.webp$/.exec(image);
  const shareImage = size ? { url: image, width: Number(size[1]), height: Number(size[2]), alt: title } : SHARE_IMAGE;
  return {
    title: branded ? title : { absolute: title },
    description: snippet(description),
    keywords: words.length ? words : undefined,
    alternates: { canonical: path, ...(languages ? { languages } : {}), ...agent.alternates },
    other: agent.other,
    openGraph: { type, title, description, url: path, images: [shareImage], ...(locale ? { locale } : {}), ...(publishedTime ? { publishedTime } : {}), ...(section ? { section } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [shareImage.url] },
  };
}
