import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getComparisons } from '@/lib/content';
import { collectionLd, pageMetadata } from '@/lib/seo-pages';

const TITLE = 'Social Media Tool Comparisons';
const DESCRIPTION = 'Side-by-side comparisons of social media scheduling and management tools: features, channels, plan structure and who each one suits.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: '/compare' });

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Compare', href: '/compare' },
];

export default function CompareIndex() {
  const list = getComparisons();
  return (
    <MarketingPage>
      <JsonLd data={collectionLd({ name: TITLE, description: DESCRIPTION, path: '/compare', crumbs, items: list.map((c) => ({ name: c.h1, href: `/compare/${c.aSlug}/${c.bSlug}` })) })} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>Compare</span>
          <h1 className={m.h1}>Social media tool comparisons</h1>
          <p className={m.lead}>Fair, side-by-side looks at popular tools: what each one is built for, which channels it covers and how plans are structured.</p>
        </section>
        <ul className={m.cards}>
          {list.map((c) => (
            <li key={c.slug}>
              <Link href={`/compare/${c.aSlug}/${c.bSlug}`} className={m.card}>
                <span className={m.cardKicker}>{c.a} vs. {c.b}</span>
                <h2 className={m.cardTitle}>{c.h1}</h2>
                <p className={m.cardText}>{c.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className={m.narrow}>
          <TrialCta heading="Looking for a simpler scheduler?">
            <p>Schedule For You publishes to ten platforms from one queue, with per-platform captions, approvals and client preview links. Solo is $19/month and Studio is $59/month.</p>
          </TrialCta>
        </div>
      </div>
    </MarketingPage>
  );
}
