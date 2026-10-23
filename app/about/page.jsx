import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getStaticPage } from '@/lib/content';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

const page = () => getStaticPage('about');

export function generateMetadata() {
  const p = page();
  return p ? pageMetadata({ title: p.title, description: p.description, path: '/about', absolute: true }) : {};
}

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
];

export default function About() {
  const p = page();
  if (!p) notFound();
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [organizationLd(), { '@type': 'AboutPage', url: abs('/about'), name: p.title, description: p.description, about: { '@id': `${abs('/')}#organization` } }, breadcrumbLd(crumbs)],
  };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>About</span>
          <h1 className={m.h1}>{p.h1}</h1>
          {p.lead && <p className={m.lead}>{p.lead}</p>}
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div dangerouslySetInnerHTML={{ __html: p.htmlBefore + p.htmlAfter }} />
          <TrialCta heading="Try it on your own accounts">
            <p>Connect your accounts, schedule a week of posts and see if it fits how you work.</p>
          </TrialCta>
        </article>
      </div>
    </MarketingPage>
  );
}
