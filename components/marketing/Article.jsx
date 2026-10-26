import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, LanguageLinks, MarketingPage, TrialCta } from './Chrome';
import m from './marketing.module.css';
import { articleLd } from '@/lib/seo-pages';
import { pageString } from '@/lib/i18n';

const dateLabel = (d, locale = 'en') => {
  const t = new Date(`${d}T12:00:00Z`);
  return Number.isNaN(t.getTime()) ? d : t.toLocaleDateString(locale === 'en' ? 'en-US' : locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

/**
 * A long-form page (blog post or comparison): hero, body with a mid-article CTA, contents, related
 * links. `locale` translates the page chrome on localized posts; `languages` lists other versions.
 */
export default function Article({ post, path, crumbs, related = [], tools = [], locale = 'en', languages }) {
  const t = (key, vars) => pageString(locale, key, vars);
  return (
    <MarketingPage lang={locale === 'en' ? undefined : locale}>
      <JsonLd data={articleLd({ post, path, crumbs, lang: locale })} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <header className={m.hero}>
          {post.category && <span className={m.eyebrow}>{post.category}</span>}
          <h1 className={m.h1}>{post.h1}</h1>
          {post.excerpt && <p className={m.lead}>{post.excerpt}</p>}
          <p className={m.meta}>
            <time dateTime={post.date}>{dateLabel(post.date, locale)}</time> · {t('readMinutes', { n: post.readingMinutes })} · {t('byTeam')}
          </p>
        </header>
        <div className={m.articleGrid}>
          <article className={m.prose}>
            <div dangerouslySetInnerHTML={{ __html: post.htmlBefore }} />
            {post.htmlAfter && (
              <aside className={m.inlineCta} aria-label="Schedule For You">
                <strong>{t('inlineCtaTitle')}</strong>
                <p>{t('inlineCtaText')}</p>
                <Link href="/signup" className={`${m.btn} ${m.btnPrimary}`}>{t('trial')}</Link>
              </aside>
            )}
            <div dangerouslySetInnerHTML={{ __html: post.htmlAfter }} />
          </article>
          {post.toc.length > 2 && (
            <nav className={m.toc} aria-label={t('onThisPage')}>
              <strong>{t('onThisPage')}</strong>
              <ol>
                {post.toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`}>{t.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
        <div className={m.narrow} style={{ marginLeft: 0 }}>
          <TrialCta heading={t('articleCtaTitle')} locale={locale}>
            <p>{t('articleCtaText')}</p>
          </TrialCta>
          <LanguageLinks current={locale} links={languages} />
          {(related.length > 0 || tools.length > 0) && (
            <div className={m.more}>
              {related.length > 0 && (
                <section>
                  <h3>{t('relatedPosts')}</h3>
                  <ul className={m.linkGrid}>
                    {related.map((p) => (
                      <li key={p.href}>
                        <Link href={p.href} className={m.linkCard}>
                          {p.name}
                          {p.kicker && <span>{p.kicker}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {tools.length > 0 && (
                <section>
                  <h3>{t('freeTools')}</h3>
                  <ul className={m.linkGrid}>
                    {tools.map((t) => (
                      <li key={t.href}>
                        <Link href={t.href} className={m.linkCard}>{t.name}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </MarketingPage>
  );
}
