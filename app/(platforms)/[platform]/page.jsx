import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getPlatformPage, getPosts, getToolPage, renderMarkdown } from '@/lib/content';
import { PLATFORM_PAGES, platformPage } from '@/lib/platform-pages';
import { postsForPlatform } from '@/lib/related';
import { TOOLS } from '@/lib/tools/registry';
import { abs, breadcrumbLd, faqPageLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

/** Landing pages for each platform we publish to: /instagram, /facebook, /x, … */
export const dynamicParams = false;

export function generateStaticParams() {
  return PLATFORM_PAGES.filter((p) => getPlatformPage(p.slug)).map((p) => ({ platform: p.slug }));
}

export async function generateMetadata({ params }) {
  const { platform } = await params;
  const page = getPlatformPage(platform);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: `/${platform}`, absolute: true, keyword: page.keyword });
}

export default async function PlatformPage({ params }) {
  const { platform } = await params;
  const meta = platformPage(platform);
  const page = getPlatformPage(platform);
  if (!meta || !page) notFound();
  const path = `/${platform}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: `${meta.name} scheduler`, href: path },
  ];
  const tools = TOOLS.filter((t) => t.platform === meta.toolPlatform).slice(0, 6);
  const posts = postsForPlatform(getPosts(), meta.toolPlatform, 3);
  const others = PLATFORM_PAGES.filter((p) => p.slug !== platform);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(),
      { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: page.title, description: page.description, isPartOf: { '@id': `${abs('/')}#website` }, inLanguage: 'en' },
      breadcrumbLd(crumbs),
      ...(page.faq.length ? [faqPageLd(page.faq)] : []),
    ],
  };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{meta.name} scheduler</span>
          <h1 className={m.h1}>{page.h1}</h1>
          {page.lead && <p className={m.lead}>{page.lead}</p>}
          <div className={m.ctaRow} style={{ justifyContent: 'center', marginTop: 22 }}>
            <Link href="/signup" className={`${m.btn} ${m.btnPrimary}`}>Start your 7-day free trial</Link>
            <Link href="/#pricing" className={m.btn}>See pricing</Link>
          </div>
          <p className={m.meta}>Card required. Not charged until day 8. Cancel anytime.</p>
        </section>

        <section className={m.narrow} aria-labelledby="specs">
          <h2 id="specs" className={m.specTitle}>{meta.name} at a glance</h2>
          <dl className={m.specs}>
            {meta.specs.map(([k, v]) => (
              <div key={k} className={m.spec}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

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
            {(tools.length > 0 || posts.length > 0) && (
              <section>
                <h3>Free {meta.name} tools and guides</h3>
                <ul className={m.linkGrid}>
                  {tools.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className={m.linkCard}>{getToolPage(t.slug)?.h1 || t.slug}<span>Free tool</span></Link>
                    </li>
                  ))}
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className={m.linkCard}>{p.h1}<span>Guide</span></Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h3>Schedule to other platforms</h3>
              <ul className={m.linkGrid}>
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className={m.linkCard}>{p.name} scheduler</Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
