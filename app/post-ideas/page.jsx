import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { INDUSTRIES, POST_IDEAS_ROOT, WEEKDAYS, WEEKDAY_NAMES, postIdeasPath } from '@/lib/post-ideas';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

const TITLE = `Social Media Post Ideas by Industry and Weekday (${new Date().getUTCFullYear()})`;
const DESCRIPTION = `30 ready-to-schedule post ideas for ${INDUSTRIES.length} kinds of business, plus a Monday-to-Sunday angle for each. Write once, schedule everywhere.`;
export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: POST_IDEAS_ROOT, absolute: true, keyword: 'social media post ideas' });
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export default function PostIdeasIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Post ideas', href: POST_IDEAS_ROOT }];
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(POST_IDEAS_ROOT)}#webpage`, url: abs(POST_IDEAS_ROOT), name: TITLE, description: DESCRIPTION, inLanguage: 'en' }, breadcrumbLd(crumbs)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}><span className={m.eyebrow}>{INDUSTRIES.length} industries · 7 weekdays</span><h1 className={m.h1}>Social media post ideas</h1><p className={m.lead}>Pick your business for 30 prompts written for your customers, or a weekday for the angle that works that day.</p></section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div className={m.more}>
            <section><h3>By business</h3><ul className={m.linkGrid}>{INDUSTRIES.map((i) => <li key={i.slug}><Link href={postIdeasPath(i.slug)} className={m.linkCard}>{cap(i.name)}</Link></li>)}</ul></section>
            <section><h3>Small business by weekday</h3><ul className={m.linkGrid}>{WEEKDAYS.map((d, i) => <li key={d}><Link href={postIdeasPath('small-business', d)} className={m.linkCard}>{WEEKDAY_NAMES[i]} post ideas</Link></li>)}</ul></section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
