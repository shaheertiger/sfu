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
export function pageMetadata({ title, description, path, type = 'website', absolute = false, keyword, publishedTime, section }) {
  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords: keyword ? [keyword] : undefined,
    alternates: { canonical: path },
    openGraph: { type, title, description, url: path, images: [SHARE_IMAGE], ...(publishedTime ? { publishedTime } : {}), ...(section ? { section } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
  };
}
