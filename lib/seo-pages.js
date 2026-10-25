import { siteUrl } from './site';
import { SITE_NAME, organizationLd } from './seo';

/**
 * Structured data for the tools, blog and comparison pages. Everything here mirrors what the page
 * shows: the breadcrumb trail, the FAQ text and the article headline.
 */

export const abs = (p) => `${siteUrl()}${p === '/' ? '/' : p}`;

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

export function toolPageLd({ page, path, crumbs }) {
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
      inLanguage: 'en',
    },
    {
      '@type': 'WebApplication',
      name: page.h1,
      url,
      description: page.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      publisher: publisher(),
    },
    { ...breadcrumbLd(crumbs), '@id': `${url}#breadcrumb` },
  ];
  if (page.faq?.length) graph.push(faqPageLd(page.faq));
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function articleLd({ post, path, crumbs }) {
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
      inLanguage: 'en',
      image: abs('/opengraph-image'),
      author: { '@type': 'Organization', name: `${SITE_NAME} team`, url: abs('/') },
      publisher: publisher(),
    },
    breadcrumbLd(crumbs),
  ];
  if (post.faq?.length) graph.push(faqPageLd(post.faq));
  return { '@context': 'https://schema.org', '@graph': graph };
}

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
  '/': 'Schedule For You is a paid social media scheduler (Solo $19/month, Studio $59/month, 7-day trial with a card) that publishes one post to X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook, Pinterest and Google Business Profile with per-platform captions, a queue, approvals, a media library, a REST API and an MCP server.',
  '/pricing': 'Two plans with unlimited posts on all ten platforms: Solo at $19/month for 15 connected accounts and Studio at $59/month for 100 accounts plus team members; yearly billing costs 10 months; 7-day free trial with a card, no free plan; a referral program gives the referrer a free month when a referred workspace pays.',
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

export function pageMetadata({ title, description, path, type = 'website', absolute = false, keyword, publishedTime, section, aiSummary }) {
  const agent = agentMetadata(path, description, aiSummary);
  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords: keyword ? [keyword] : undefined,
    alternates: { canonical: path, ...agent.alternates },
    other: agent.other,
    openGraph: { type, title, description, url: path, images: [SHARE_IMAGE], ...(publishedTime ? { publishedTime } : {}), ...(section ? { section } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
  };
}
