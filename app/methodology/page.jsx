import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import { Table } from '@/components/marketing/BestTimeCountry';
import m from '@/components/marketing/marketing.module.css';
import { getStaticPage } from '@/lib/content';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { TRENDS_META } from '@/lib/best-time-trends';
import { countryByCode } from '@/lib/best-time';
import { BEST_TIME_ROOT } from '@/lib/best-time-pages';
import { SPECS_ROOT, SPECS_VERIFIED } from '@/lib/specs';
import { NOTIFY_ROOT, NOTIFY_VERIFIED } from '@/lib/notify';

/** Where the data pages get their numbers. The prose is content/pages/methodology.md; the coverage table comes from the data itself. */
const page = () => getStaticPage('methodology');
const crumbs = [{ name: 'Home', href: '/' }, { name: 'Methodology', href: '/methodology' }];
const names = (codes) => codes.map((c) => countryByCode(c)?.short || c).join(', ');

export function generateMetadata() {
  const p = page();
  return p ? pageMetadata({ title: p.title, description: p.description, path: '/methodology', absolute: true }) : {};
}

export default function Methodology() {
  const p = page();
  if (!p) notFound();
  const coverage = [
    ['Google Trends, measured directly', String(TRENDS_META.countryCount), names(TRENDS_META.measured)],
    ['Estimate (local Wikipedia activity × measured pattern)', String(TRENDS_META.estimatedCount), names(TRENDS_META.estimated)],
    ['Starting baseline (not measured)', String(TRENDS_META.baselineCount), names(TRENDS_META.baseline)],
  ].filter((r) => r[1] !== '0');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [organizationLd(), { '@type': 'WebPage', '@id': `${abs('/methodology')}#webpage`, url: abs('/methodology'), name: p.title, description: p.description, inLanguage: 'en', ...(p.updated ? { dateModified: p.updated } : {}), publisher: { '@id': `${abs('/')}#organization` } }, breadcrumbLd(crumbs)],
  };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>Methodology{p.updated ? ` · updated ${p.updated}` : ''}</span>
          <h1 className={m.h1}>{p.h1}</h1>
          {p.lead && <p className={m.lead}>{p.lead}</p>}
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div dangerouslySetInnerHTML={{ __html: p.htmlBefore }} />
          {/* The <!-- cta --> marker in the markdown marks where the coverage table goes. */}
          <Table head={['Source', 'Countries', 'Which']} rows={coverage} />
          <p>Google Trends data last refreshed {TRENDS_META.fetchedAt}; the pages are rebuilt daily. See the <Link href={BEST_TIME_ROOT}>best time to post</Link> pages.</p>
          <div dangerouslySetInnerHTML={{ __html: p.htmlAfter }} />
          <p>Last verified: <Link href={SPECS_ROOT}>sizes and limits</Link> {SPECS_VERIFIED}; <Link href={NOTIFY_ROOT}>does it notify</Link> {NOTIFY_VERIFIED}.</p>
          <TrialCta heading="Schedule posts at the times you choose">
            <p>Pick your slots, fill the week and let Schedule For You publish. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p>
          </TrialCta>
        </article>
      </div>
    </MarketingPage>
  );
}
