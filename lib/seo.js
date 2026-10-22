import { siteUrl } from './site';

/**
 * Facts search engines are told about the site. Keep these in step with what the pages show:
 * Google and Bing both treat structured data that doesn't match the visible page as spam.
 */
export const SITE_NAME = 'Schedule For You';
export const TAGLINE = 'Write it once. Post it everywhere.';
export const DESCRIPTION =
  'Schedule For You is a social media scheduler: write one post, tailor it per platform and publish to X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook, Pinterest and Google Business from one queue. 7-day free trial.';

export const PLATFORMS = ['X', 'Bluesky', 'Instagram', 'LinkedIn', 'Threads', 'TikTok', 'YouTube', 'Facebook', 'Pinterest', 'Google Business Profile'];

/** Plans as shown on the landing page and in the plan picker (lib/server/billing.ts). */
export const PLANS = [
  { id: 'solo', name: 'Solo', price: 19, accounts: 15 },
  { id: 'studio', name: 'Studio', price: 59, accounts: 100 },
];

/** The FAQ shown on the landing page (components/LandingMobile.jsx). */
export const FAQ = [
  ['Which platforms can I post to?', 'X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook, Pinterest and Google Business Profile.'],
  ['Can I change a post for one platform?', 'Yes. Write one caption, then tailor it per platform. Edits to one never touch the others.'],
  ['What happens if a post fails?', 'You get an alert right away with the reason, and a one-tap retry or reconnect.'],
  ['Is there an API?', 'Every workspace includes a REST API and an MCP server.'],
  ['Do I need a card for the trial?', 'Yes. Add a card to start the 7-day free trial. You are not charged until day 8, and you can cancel before then.'],
  ['Can I cancel?', 'Cancel anytime. There is no contract.'],
];

const ORG_ID = () => `${siteUrl()}/#organization`;
const SITE_ID = () => `${siteUrl()}/#website`;

export function organizationLd() {
  const base = siteUrl();
  return {
    '@type': 'Organization',
    '@id': ORG_ID(),
    name: SITE_NAME,
    url: `${base}/`,
    logo: { '@type': 'ImageObject', url: `${base}/brand/logo-512.png`, width: 512, height: 512 },
  };
}

export function websiteLd() {
  const base = siteUrl();
  return {
    '@type': 'WebSite',
    '@id': SITE_ID(),
    url: `${base}/`,
    name: SITE_NAME,
    description: DESCRIPTION,
    publisher: { '@id': ORG_ID() },
    inLanguage: 'en',
  };
}

export function softwareLd() {
  const base = siteUrl();
  return {
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: `${base}/`,
    description: DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Social media scheduling',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    featureList: ['Per-platform captions', 'Queue and calendar', 'Client preview links and approvals', 'REST API and MCP server', 'RSS auto-post', 'Webhooks'],
    screenshot: `${base}/opengraph-image`,
    publisher: { '@id': ORG_ID() },
    offers: PLANS.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      description: `${p.accounts} connected accounts`,
      price: p.price,
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'USD', billingDuration: 'P1M' },
      url: `${base}/signup`,
      availability: 'https://schema.org/InStock',
    })),
  };
}

export function faqLd() {
  return {
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

/** The JSON-LD graph for the landing page. The FAQ block is only included where the FAQ is on the page. */
export function landingLd({ withFaq = false } = {}) {
  const graph = [organizationLd(), websiteLd(), softwareLd()];
  if (withFaq) graph.push(faqLd());
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Serialises JSON-LD for a <script> tag; `<` is escaped so page content can never close the tag. */
export const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
