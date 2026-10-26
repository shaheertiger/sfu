import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import ToolWidget from '@/components/tools/ToolWidget';
import { Breadcrumbs, LanguageLinks, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getLocalizedPages, getPlatformPage, getToolPage, renderMarkdownIntl } from '@/lib/content';
import { localeData, localePath, pageString } from '@/lib/i18n';
import { allLocalizedPages, basePath, extraKeywords, hasTwin, hreflangMap, localizedPage, translationsOf } from '@/lib/i18n-pages';
import { PLATFORM_PAGES, platformPage } from '@/lib/platform-pages';
import { PLATFORM_NAMES, relatedTools, toolBySlug } from '@/lib/tools/registry';
import { abs, breadcrumbLd, faqPageLd, pageMetadata, toolPageLd } from '@/lib/seo-pages';
import Article from '@/components/marketing/Article';
import { organizationLd } from '@/lib/seo';

/**
 * Localized tool pages (/de/tools/<slug>) and platform pages (/de/instagram). The route files in
 * app/<locale>/ are one-liners that call these factories with their language.
 */

/** Every language version of a page, English first (when it exists), for the language links. */
const versions = (kind, slug) => [...(hasTwin(kind, slug) ? [{ locale: 'en', name: localeData('en').name, path: basePath(kind, slug) }] : []), ...translationsOf(kind, slug)];

function metadataFor(locale, kind, slug) {
  const page = localizedPage(locale, kind, slug);
  if (!page) return {};
  const blog = kind === 'blog';
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: localePath(locale, basePath(kind, slug)),
    absolute: !blog,
    ...(blog ? { type: 'article', publishedTime: page.date, section: page.category } : {}),
    keyword: page.keyword,
    keywords: extraKeywords(page),
    languages: hreflangMap(kind, slug),
    locale: localeData(locale).ogLocale,
  });
}

function Faq({ locale, faq }) {
  if (!faq.length) return null;
  return (
    <section className={m.faq} aria-labelledby="faq">
      <h2 id="faq">{localeData(locale).faqHeading}</h2>
      {faq.map((f) => (
        <div key={f.q} className={m.faqItem}>
          <h3>{f.q}</h3>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdownIntl(f.a) }} />
        </div>
      ))}
    </section>
  );
}

function Sections({ sections }) {
  return sections.map((s) => (
    <section key={s.id} className={m.section}>
      <h2 id={s.id}>{s.heading}</h2>
      <div dangerouslySetInnerHTML={{ __html: s.html }} />
    </section>
  ));
}

/** Other localized pages in the same language, as link cards. */
function sameLanguagePages(locale, exceptPath) {
  return allLocalizedPages().filter((p) => p.locale === locale && p.path !== exceptPath);
}

function LinkCard({ href, title, tag, lang }) {
  return (
    <li>
      <Link href={href} className={m.linkCard} hrefLang={lang} lang={lang}>
        {title}
        {tag && <span>{tag}</span>}
      </Link>
    </li>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export function localizedToolRoute(locale) {
  const generateStaticParams = () =>
    getLocalizedPages(locale, 'tools')
      .filter((p) => toolBySlug(p.slug))
      .map((p) => ({ slug: p.slug }));

  const generateMetadata = async ({ params }) => metadataFor(locale, 'tools', (await params).slug);

  async function Page({ params }) {
    const { slug } = await params;
    const page = localizedPage(locale, 'tools', slug);
    const tool = toolBySlug(slug);
    if (!page || !tool) notFound();
    const path = localePath(locale, basePath('tools', slug));
    const crumbs = [
      { name: pageString(locale, 'home'), href: '/' },
      { name: pageString(locale, 'freeTools'), href: '/tools' },
      { name: page.h1, href: path },
    ];
    const config = { ...tool.config, ...(page.sample ? { sample: page.sample } : {}), ...(page.role ? { role: page.role } : {}), ...(page.topic ? { topic: page.topic } : {}) };
    const local = sameLanguagePages(locale, path);
    const english = relatedTools(tool, 4);
    return (
      <MarketingPage lang={locale}>
        <JsonLd data={toolPageLd({ page, path, crumbs, lang: locale })} />
        <div className={m.container}>
          <Breadcrumbs items={crumbs} />
          <section className={m.hero}>
            <span className={m.eyebrow}>{pageString(locale, 'toolEyebrow')}</span>
            <h1 className={m.h1}>{page.h1}</h1>
            {page.lead && <p className={m.lead}>{page.lead}</p>}
            <div className={m.toolArea}>
              <ToolWidget kind={tool.kind} config={config} platform={tool.platform} locale={locale} />
            </div>
          </section>

          <article className={`${m.narrow} ${m.prose}`}>
            <Sections sections={page.sections} />
            <Faq locale={locale} faq={page.faq} />
            {page.cta && <TrialCta heading={page.cta.heading} html={page.cta.html} locale={locale} />}
            <LanguageLinks current={locale} links={versions('tools', slug)} />

            <div className={m.more}>
              {local.length > 0 && (
                <section>
                  <h3>{pageString(locale, 'moreTools')}</h3>
                  <ul className={m.linkGrid}>
                    {local.map((p) => (
                      <LinkCard key={p.path} href={p.path} title={p.page.h1} tag={p.kind === 'tools' ? pageString(locale, 'freeToolTag') : null} />
                    ))}
                  </ul>
                </section>
              )}
              {english.length > 0 && (
                <section>
                  <h3>{pageString(locale, 'checkAlso')}</h3>
                  <ul className={m.linkGrid}>
                    {english.map((t) => (
                      <LinkCard key={t.slug} href={`/tools/${t.slug}`} title={getToolPage(t.slug)?.h1 || t.slug} tag={`${PLATFORM_NAMES[t.platform]} · ${pageString(locale, 'englishTag')}`} lang="en" />
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

  return { generateStaticParams, generateMetadata, Page };
}

/* ---------------------------------------------------------------------------------------------- */

export function localizedPlatformRoute(locale) {
  const generateStaticParams = () =>
    getLocalizedPages(locale, 'platforms')
      .filter((p) => platformPage(p.slug) && getPlatformPage(p.slug))
      .map((p) => ({ platform: p.slug }));

  const generateMetadata = async ({ params }) => metadataFor(locale, 'platforms', (await params).platform);

  async function Page({ params }) {
    const { platform } = await params;
    const meta = platformPage(platform);
    const page = localizedPage(locale, 'platforms', platform);
    if (!meta || !page) notFound();
    const path = localePath(locale, basePath('platforms', platform));
    const crumbs = [
      { name: pageString(locale, 'home'), href: '/' },
      { name: pageString(locale, 'scheduler', { name: meta.name }), href: path },
    ];
    const specs = localeData(locale).specs?.[platform] || meta.specs;
    const tools = sameLanguagePages(locale, path).filter((p) => p.kind === 'tools' && ['all', meta.toolPlatform].includes(toolBySlug(p.slug)?.platform));
    const localPlatforms = sameLanguagePages(locale, path).filter((p) => p.kind === 'platforms');
    const others = PLATFORM_PAGES.filter((p) => p.slug !== platform && !localPlatforms.some((l) => l.slug === p.slug));
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        organizationLd(),
        { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: page.title, description: page.description, isPartOf: { '@id': `${abs('/')}#website` }, inLanguage: locale },
        breadcrumbLd(crumbs),
        ...(page.faq.length ? [faqPageLd(page.faq)] : []),
      ],
    };
    return (
      <MarketingPage lang={locale}>
        <JsonLd data={ld} />
        <div className={m.container}>
          <Breadcrumbs items={crumbs} />
          <section className={m.hero}>
            <span className={m.eyebrow}>{pageString(locale, 'scheduler', { name: meta.name })}</span>
            <h1 className={m.h1}>{page.h1}</h1>
            {page.lead && <p className={m.lead}>{page.lead}</p>}
            <div className={m.ctaRow} style={{ justifyContent: 'center', marginTop: 22 }}>
              <Link href="/signup" className={`${m.btn} ${m.btnPrimary}`}>{pageString(locale, 'trial')}</Link>
              <Link href="/pricing" className={m.btn}>{pageString(locale, 'pricing')}</Link>
            </div>
            <p className={m.meta}>{pageString(locale, 'trialNote')}</p>
          </section>

          <section className={m.narrow} aria-labelledby="specs">
            <h2 id="specs" className={m.specTitle}>{pageString(locale, 'atAGlance', { name: meta.name })}</h2>
            <dl className={m.specs}>
              {specs.map(([k, v]) => (
                <div key={k} className={m.spec}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <article className={`${m.narrow} ${m.prose}`}>
            <Sections sections={page.sections} />
            <Faq locale={locale} faq={page.faq} />
            {page.cta && <TrialCta heading={page.cta.heading} html={page.cta.html} locale={locale} />}
            <LanguageLinks current={locale} links={versions('platforms', platform)} />
            <div className={m.more}>
              {tools.length > 0 && (
                <section>
                  <h3>{pageString(locale, 'platformTools', { name: meta.name })}</h3>
                  <ul className={m.linkGrid}>
                    {tools.map((p) => (
                      <LinkCard key={p.path} href={p.path} title={p.page.h1} tag={pageString(locale, 'freeToolTag')} />
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h3>{pageString(locale, 'otherPlatforms')}</h3>
                <ul className={m.linkGrid}>
                  {localPlatforms.map((p) => (
                    <LinkCard key={p.path} href={p.path} title={p.page.h1} />
                  ))}
                  {others.map((p) => (
                    <LinkCard key={p.slug} href={`/${p.slug}`} title={p.name} tag={pageString(locale, 'englishTag')} lang="en" />
                  ))}
                </ul>
              </section>
            </div>
          </article>
        </div>
      </MarketingPage>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}

/* ---------------------------------------------------------------------------------------------- */

/** Localized blog posts (/es/blog/<slug>): the English article layout with translated chrome. */
export function localizedBlogRoute(locale) {
  const generateStaticParams = () => getLocalizedPages(locale, 'blog').map((p) => ({ slug: p.slug }));

  const generateMetadata = async ({ params }) => metadataFor(locale, 'blog', (await params).slug);

  async function Page({ params }) {
    const { slug } = await params;
    const post = localizedPage(locale, 'blog', slug);
    if (!post) notFound();
    const path = localePath(locale, basePath('blog', slug));
    const crumbs = [
      { name: pageString(locale, 'home'), href: '/' },
      { name: pageString(locale, 'blog'), href: '/blog' },
      { name: post.h1, href: path },
    ];
    const local = sameLanguagePages(locale, path);
    const related = local.filter((p) => p.kind === 'blog').slice(0, 3).map((p) => ({ href: p.path, name: p.page.h1, kicker: p.page.category }));
    const tools = local.filter((p) => p.kind !== 'blog').slice(0, 4).map((p) => ({ href: p.path, name: p.page.h1 }));
    return <Article post={post} path={path} crumbs={crumbs} related={related} tools={tools} locale={locale} languages={versions('blog', slug)} />;
  }

  return { generateStaticParams, generateMetadata, Page };
}
