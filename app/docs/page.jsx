import JsonLd from '@/components/JsonLd';
import ApiReference from '@/components/docs/ApiReference';
import { MarketingPage } from '@/components/marketing/Chrome';
import { organizationLd } from '@/lib/seo';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { siteUrl } from '@/lib/site';

const PATH = '/docs';
const TITLE = 'Schedule For You API Reference: Posts, Media and Webhooks';
const DESCRIPTION = 'Reference for the Schedule For You REST API: authenticate with an API key, create and schedule posts, upload media, manage RSS feeds and verify webhooks.';

export const dynamic = 'force-static';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH, absolute: true, keyword: 'social media scheduling api reference' });

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'API', href: '/api' },
  { name: 'API reference', href: PATH },
];

export default function DocsPage() {
  const url = abs(PATH);
  return (
    <MarketingPage>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            organizationLd(),
            {
              '@type': 'TechArticle',
              '@id': `${url}#article`,
              headline: 'Schedule For You API reference',
              name: TITLE,
              description: DESCRIPTION,
              url,
              mainEntityOfPage: url,
              inLanguage: 'en',
              isPartOf: { '@id': `${siteUrl()}/#website` },
              publisher: { '@id': `${siteUrl()}/#organization` },
            },
            breadcrumbLd(crumbs),
          ],
        }}
      />
      <ApiReference crumbs={crumbs} />
    </MarketingPage>
  );
}
