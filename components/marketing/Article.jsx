import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from './Chrome';
import m from './marketing.module.css';
import { articleLd } from '@/lib/seo-pages';

const dateLabel = (d) => {
  const t = new Date(`${d}T12:00:00Z`);
  return Number.isNaN(t.getTime()) ? d : t.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

/** A long-form page (blog post or comparison): hero, body with a mid-article CTA, contents, related links. */
export default function Article({ post, path, crumbs, related = [], tools = [] }) {
  return (
    <MarketingPage>
      <JsonLd data={articleLd({ post, path, crumbs })} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <header className={m.hero}>
          {post.category && <span className={m.eyebrow}>{post.category}</span>}
          <h1 className={m.h1}>{post.h1}</h1>
          {post.excerpt && <p className={m.lead}>{post.excerpt}</p>}
          <p className={m.meta}>
            <time dateTime={post.date}>{dateLabel(post.date)}</time> · {post.readingMinutes} min read · Schedule For You team
          </p>
        </header>
        <div className={m.articleGrid}>
          <article className={m.prose}>
            <div dangerouslySetInnerHTML={{ __html: post.htmlBefore }} />
            {post.htmlAfter && (
              <aside className={m.inlineCta} aria-label="Schedule For You">
                <strong>Plan once, post everywhere</strong>
                <p>Schedule For You lets you write one post, tailor it per platform and publish to X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook Pages, Pinterest and Google Business Profile.</p>
                <Link href="/signup" className={`${m.btn} ${m.btnPrimary}`}>Start your 7-day free trial</Link>
              </aside>
            )}
            <div dangerouslySetInnerHTML={{ __html: post.htmlAfter }} />
          </article>
          {post.toc.length > 2 && (
            <nav className={m.toc} aria-label="On this page">
              <strong>On this page</strong>
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
          <TrialCta heading="Schedule a week of posts in one sitting">
            <p>Queue posts for ten platforms, tailor each caption, and get an alert if anything fails. Plans start at $19/month after your trial.</p>
          </TrialCta>
          {(related.length > 0 || tools.length > 0) && (
            <div className={m.more}>
              {related.length > 0 && (
                <section>
                  <h3>Related posts</h3>
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
                  <h3>Free tools</h3>
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
