import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import ToolWidget from '@/components/tools/ToolWidget';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getPosts, getToolPage, getToolPages, renderMarkdown } from '@/lib/content';
import { PLATFORM_NAMES, relatedTools, samePlatformTools, toolBySlug } from '@/lib/tools/registry';
import { postsForPlatform } from '@/lib/related';
import { pageMetadata, toolPageLd } from '@/lib/seo-pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return getToolPages()
    .filter((p) => toolBySlug(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getToolPage(slug);
  if (!page) return {};
  const path = `/tools/${slug}`;
  return pageMetadata({ title: page.title, description: page.description, path, absolute: true, keyword: page.keyword });
}

const titleOf = (slug) => getToolPage(slug)?.h1 || slug;

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const page = getToolPage(slug);
  const tool = toolBySlug(slug);
  if (!page || !tool) notFound();
  const path = `/tools/${slug}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Free tools', href: '/tools' },
    { name: page.h1, href: path },
  ];
  const more = relatedTools(tool, 6);
  const also = samePlatformTools(tool, 4);
  const posts = postsForPlatform(getPosts(), tool.platform, 3);

  return (
    <MarketingPage>
      <JsonLd data={toolPageLd({ page, path, crumbs })} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>Free tool · No sign-up</span>
          <h1 className={m.h1}>{page.h1}</h1>
          {page.lead && <p className={m.lead}>{page.lead}</p>}
          <div className={m.toolArea}>
            <ToolWidget kind={tool.kind} config={tool.config} platform={tool.platform} />
          </div>
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
            <section>
              <h3>More free tools</h3>
              <ul className={m.linkGrid}>
                {more.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className={m.linkCard}>{titleOf(t.slug)}</Link>
                  </li>
                ))}
              </ul>
            </section>
            {(also.length > 0 || posts.length > 0) && (
              <section>
                <h3>Check also</h3>
                <ul className={m.linkGrid}>
                  {also.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/tools/${t.slug}`} className={m.linkCard}>
                        {titleOf(t.slug)}
                        <span>{PLATFORM_NAMES[t.platform]} tool</span>
                      </Link>
                    </li>
                  ))}
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className={m.linkCard}>
                        {p.h1}
                        <span>Guide</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
