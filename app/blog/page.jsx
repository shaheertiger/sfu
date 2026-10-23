import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getComparisons, getPosts, getStaticPage } from '@/lib/content';
import { collectionLd, pageMetadata } from '@/lib/seo-pages';

const TITLE = 'Social Media Guides and How-Tos';
const DESCRIPTION = 'Practical social media guides: image and video sizes, when to post, Instagram, TikTok, Facebook and LinkedIn how-tos, and tool comparisons.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: '/blog' });

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
];

function Card({ href, kicker, title, text }) {
  return (
    <li>
      <Link href={href} className={m.card}>
        <span className={m.cardKicker}>{kicker}</span>
        <h3 className={m.cardTitle}>{title}</h3>
        <p className={m.cardText}>{text}</p>
      </Link>
    </li>
  );
}

const ORDER = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'X', 'LinkedIn', 'Strategy', 'Discord', 'Reddit'];

export default function BlogIndex() {
  const posts = getPosts();
  const compares = getComparisons();
  const guides = posts.filter((p) => p.category === 'Guides');
  const cats = [...ORDER, ...new Set(posts.map((p) => p.category).filter((c) => c !== 'Guides' && !ORDER.includes(c)))];
  const groups = cats.map((c) => ({ c, list: posts.filter((p) => p.category === c) })).filter((g) => g.list.length);
  return (
    <MarketingPage>
      <JsonLd
        data={collectionLd({
          name: TITLE,
          description: DESCRIPTION,
          path: '/blog',
          crumbs,
          items: [...posts.map((p) => ({ name: p.h1, href: `/blog/${p.slug}` })), ...compares.map((c) => ({ name: c.h1, href: `/compare/${c.aSlug}/${c.bSlug}` }))],
        })}
      />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>Blog</span>
          <h1 className={m.h1}>Social media guides</h1>
          <p className={m.lead}>Clear answers on sizes, timing, settings and payouts for every major platform, written to be used, not skimmed past.</p>
          <nav aria-label="Topics" className={m.ctaRow} style={{ justifyContent: 'center', marginTop: 18 }}>
            {groups.map((g) => (
              <a key={g.c} href={`#${g.c.toLowerCase()}`} className={m.btn} style={{ minHeight: 38, fontSize: 14 }}>{g.c}</a>
            ))}
            {compares.length > 0 && <a href="#comparisons" className={m.btn} style={{ minHeight: 38, fontSize: 14 }}>Comparisons</a>}
            {guides.length > 0 && <a href="#guides" className={m.btn} style={{ minHeight: 38, fontSize: 14 }}>Product guides</a>}
          </nav>
        </section>
        {groups.map((g) => (
          <section key={g.c} className={m.group} aria-labelledby={g.c.toLowerCase()}>
            <h2 id={g.c.toLowerCase()}>{g.c}</h2>
            <ul className={m.cards}>
              {g.list.map((p) => (
                <Card key={p.slug} href={`/blog/${p.slug}`} kicker={p.category} title={p.h1} text={p.excerpt} />
              ))}
            </ul>
          </section>
        ))}
        {compares.length > 0 && (
          <section className={m.group} aria-labelledby="comparisons">
            <h2 id="comparisons">Comparisons</h2>
            <ul className={m.cards}>
              {getStaticPage('later-alternative') && (
                <Card href="/later-alternative" kicker="Alternative" title={getStaticPage('later-alternative').h1} text={getStaticPage('later-alternative').excerpt} />
              )}
              {compares.map((c) => (
                <Card key={c.slug} href={`/compare/${c.aSlug}/${c.bSlug}`} kicker="Comparison" title={c.h1} text={c.excerpt} />
              ))}
            </ul>
          </section>
        )}
        {guides.length > 0 && (
          <section className={m.group} aria-labelledby="guides">
            <h2 id="guides">Schedule For You guides</h2>
            <ul className={m.cards}>
              {guides.map((p) => (
                <Card key={p.slug} href={`/blog/${p.slug}`} kicker="Guide" title={p.h1} text={p.excerpt} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </MarketingPage>
  );
}
