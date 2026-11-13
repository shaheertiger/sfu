import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { INDUSTRIES, POST_IDEAS_ROOT, WEEKDAY_ANGLES, WEEKDAYS, WEEKDAY_NAMES, postIdeasPath } from '@/lib/post-ideas';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

const TITLE = `Social Media Post Ideas by Industry (${new Date().getUTCFullYear()}): 30 Each, Ready to Schedule`;
const DESCRIPTION = `30 ready-to-schedule post ideas for each of ${INDUSTRIES.length} kinds of business, plus a Monday-to-Sunday plan for each. Write once, schedule everywhere.`;
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
        <section className={m.hero}><span className={m.eyebrow}>{INDUSTRIES.length} industries · a plan for every weekday</span><h1 className={m.h1}>Social media post ideas</h1><p className={m.lead}>Pick your business for 30 prompts written for your customers and a plan for each day of the week.</p></section>
        <article className={`${m.narrow} ${m.prose}`}>
          <section className={m.section}>
            <h2 id="by-day">What to Post on Each Day of the Week</h2>
            <p>Every industry page fills these angles with posts written for that business.</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Day</th><th>Angle</th><th>Why it works</th></tr></thead>
                <tbody>{WEEKDAYS.map((d, i) => <tr key={d}><td>{WEEKDAY_NAMES[i]}</td><td>{WEEKDAY_ANGLES[d].hook}</td><td>{WEEKDAY_ANGLES[d].note}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <div className={m.more}>
            <section><h3>By business</h3><ul className={m.linkGrid}>{INDUSTRIES.map((i) => <li key={i.slug}><Link href={postIdeasPath(i.slug)} className={m.linkCard}>{cap(i.name)}</Link></li>)}</ul></section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
