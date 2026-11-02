import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { BEST_TIME_PLATFORMS, COUNTRIES } from '@/lib/best-time';
import { BEST_TIME_ROOT, pagePath } from '@/lib/best-time-pages';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

export const revalidate = 86400;

const TITLE = 'Best Time to Post on Social Media: Instagram, TikTok, Facebook, LinkedIn & More';
const DESCRIPTION = 'Hour-by-hour best posting times for every platform, every weekday and 24 countries, from real scheduling data, updated daily.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: BEST_TIME_ROOT, absolute: true, keyword: 'best time to post on social media' });

export default function BestTimeIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Best time to post', href: BEST_TIME_ROOT }];
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(BEST_TIME_ROOT)}#webpage`, url: abs(BEST_TIME_ROOT), name: TITLE, description: DESCRIPTION, inLanguage: 'en' }, breadcrumbLd(crumbs)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>Updated daily · local time</span>
          <h1 className={m.h1}>Best time to post on social media</h1>
          <p className={m.lead}>Pick a platform for a full-week heatmap, then narrow it to a weekday or the country your audience is in. Built from posts scheduled through Schedule For You, not a survey.</p>
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div className={m.more}>
            <section>
              <h3>By platform</h3>
              <ul className={m.linkGrid}>
                {BEST_TIME_PLATFORMS.map((p) => <li key={p.slug}><Link href={pagePath(p.slug)} className={m.linkCard}>Best time to post on {p.name}</Link></li>)}
              </ul>
            </section>
            <section>
              <h3>Instagram by country</h3>
              <ul className={m.linkGrid}>
                {COUNTRIES.map((c) => <li key={c.slug}><Link href={pagePath('instagram', `in-${c.slug}`)} className={m.linkCard}>{c.short}</Link></li>)}
              </ul>
            </section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
