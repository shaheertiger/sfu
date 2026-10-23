import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Article from './Article';
import { Breadcrumbs, MarketingPage, TrialCta } from './Chrome';
import m from './marketing.module.css';
import { getComparisons, getContentPage, renderMarkdown } from '@/lib/content';
import { LANDING_PAGES } from '@/lib/landing-pages';
import { PLANS, organizationLd, softwareLd } from '@/lib/seo';
import { abs, breadcrumbLd, faqPageLd, pageMetadata } from '@/lib/seo-pages';

/** Metadata for a standalone page in content/pages. */
export function contentMetadata(slug) {
  const c = getContentPage(slug);
  if (!c) return {};
  const { page, layout } = c;
  return pageMetadata({ title: page.title, description: page.description, path: `/${slug}`, absolute: layout !== 'legal', keyword: page.keyword, type: layout === 'article' ? 'article' : 'website', publishedTime: page.date });
}

const PLAN_FEATURES = {
  solo: ['15 connected accounts', 'Unlimited posts', 'All 10 platforms', 'Queue, calendar and bulk CSV', 'Approvals and client preview links', 'RSS, webhooks and REST API'],
  studio: ['100 connected accounts', 'Team members', 'Priority support', 'Everything in Solo'],
};

function PlanTable() {
  return (
    <section className={m.narrow} aria-labelledby="plans">
      <h2 id="plans" className={m.specTitle}>Plans</h2>
      <dl className={m.specs}>
        {PLANS.map((p) => (
          <div key={p.id} className={m.spec}>
            <dt>{p.name}</dt>
            <dd>
              <strong style={{ fontSize: 28, letterSpacing: '-0.03em' }}>${p.price}</strong> / month
              <div style={{ marginTop: 4, fontSize: 14, color: '#c4c7cc' }}>
                or <strong style={{ color: '#fff' }}>${p.yearly} / year</strong> billed yearly (2 months free, ${(p.yearly / 12).toFixed(2)} a month)
              </div>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: '#c4c7cc', fontSize: 14, lineHeight: 1.6 }}>
                {PLAN_FEATURES[p.id].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <p className={m.meta} style={{ textAlign: 'left', marginTop: -8 }}>7-day free trial on both plans, billed monthly or yearly. Card required, not charged until day 8, cancel anytime.</p>
    </section>
  );
}

function FeaturePage({ slug, page }) {
  const path = `/${slug}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: page.h1.length > 40 ? LANDING_PAGES.find((p) => p.slug === slug)?.name || page.h1 : page.h1, href: path },
  ];
  const graph = [
    organizationLd(),
    { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: page.title, description: page.description, isPartOf: { '@id': `${abs('/')}#website` }, inLanguage: 'en' },
    breadcrumbLd(crumbs),
  ];
  if (slug === 'pricing') graph.push(softwareLd());
  if (page.faq.length) graph.push(faqPageLd(page.faq));
  const others = LANDING_PAGES.filter((p) => p.slug !== slug && p.group === 'Product');
  return (
    <MarketingPage>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <h1 className={m.h1}>{page.h1}</h1>
          {page.lead && <p className={m.lead}>{page.lead}</p>}
          <div className={m.ctaRow} style={{ justifyContent: 'center', marginTop: 22 }}>
            <Link href="/signup" className={`${m.btn} ${m.btnPrimary}`}>Start your 7-day free trial</Link>
            {slug === 'api' && <Link href="/docs" className={m.btn}>Read the API reference</Link>}
            {slug !== 'pricing' && <Link href="/pricing" className={m.btn}>See pricing</Link>}
          </div>
          <p className={m.meta}>Card required. Not charged until day 8. Cancel anytime.</p>
        </section>
        {slug === 'pricing' && <PlanTable />}
        <article className={`${m.narrow} ${m.prose}`}>
          {page.sections.map((s) => (
            <section key={s.id} className={m.section}>
              <h2 id={s.id}>{s.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: s.html }} />
            </section>
          ))}
          {page.faq.length > 0 && (
            <section className={m.faq} aria-labelledby="faq">
              <h2 id="faq">Frequently asked questions</h2>
              {page.faq.map((f) => (
                <div key={f.q} className={m.faqItem}>
                  <h3>{f.q}</h3>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(f.a) }} />
                </div>
              ))}
            </section>
          )}
          {page.cta && <TrialCta heading={page.cta.heading} html={page.cta.html} />}
          <div className={m.more}>
            <section>
              <h3>More from Schedule For You</h3>
              <ul className={m.linkGrid}>
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className={m.linkCard}>{p.name}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/tools" className={m.linkCard}>Free tools</Link>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}

const longDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Privacy policy, data deletion and similar: plain reading layout with a table of contents. */
function LegalPage({ slug, page }) {
  const path = `/${slug}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: page.h1, href: path },
  ];
  return (
    <MarketingPage>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'WebPage', url: abs(path), name: page.title, description: page.description, inLanguage: 'en', ...(page.updated ? { dateModified: page.updated } : {}) }, breadcrumbLd(crumbs)] }} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <header className={m.hero} style={{ textAlign: 'left', maxWidth: 760, margin: '0 auto' }}>
          <h1 className={m.h1}>{page.h1}</h1>
          {page.lead && <p className={m.lead} style={{ margin: 0 }}>{page.lead}</p>}
          {page.updated && <p className={m.meta} style={{ textAlign: 'left' }}>Last updated {longDate(page.updated)}</p>}
        </header>
        <article className={`${m.narrow} ${m.prose}`}>
          {page.toc.length > 3 && (
            <nav aria-label="Contents" className={m.inlineCta} style={{ margin: '0 0 28px' }}>
              <strong>Contents</strong>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {page.toc.map((t) => (
                  <li key={t.id} style={{ margin: '4px 0' }}>
                    <a href={`#${t.id}`}>{t.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div dangerouslySetInnerHTML={{ __html: page.htmlBefore + page.htmlAfter }} />
        </article>
      </div>
    </MarketingPage>
  );
}

/** Renders content/pages/<slug>.md with the layout its frontmatter asks for. */
export default function ContentPage({ slug }) {
  const c = getContentPage(slug);
  if (!c) notFound();
  if (c.layout === 'feature') return <FeaturePage slug={slug} page={c.page} />;
  if (c.layout === 'legal') return <LegalPage slug={slug} page={c.page} />;
  const path = `/${slug}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: LANDING_PAGES.find((p) => p.slug === slug)?.name || c.page.h1, href: path },
  ];
  const related = [
    ...LANDING_PAGES.filter((p) => p.group === 'Compare' && p.slug !== slug && getContentPage(p.slug)).map((p) => ({ href: `/${p.slug}`, name: getContentPage(p.slug).page.h1, kicker: 'Comparison' })),
    ...getComparisons().map((x) => ({ href: `/compare/${x.aSlug}/${x.bSlug}`, name: x.h1, kicker: 'Comparison' })),
  ].slice(0, 6);
  return <Article post={c.page} path={path} crumbs={crumbs} related={related} />;
}
