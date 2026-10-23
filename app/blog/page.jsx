import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getComparisons, getPosts } from '@/lib/content';
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

export default function BlogIndex() {
  const posts = getPosts();
  const compares = getComparisons();
  const guides = posts.filter((p) => p.category === 'Guides');
  const articles = posts.filter((p) => p.category !== 'Guides');
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
          <p className={m.lead}>Clear answers on sizes, timing and settings for every major platform, written to be used, not skimmed past.</p>
        </section>
        <section className={m.group} aria-labelledby="articles">
          <h2 id="articles">Articles</h2>
          <ul className={m.cards}>
            {articles.map((p) => (
              <Card key={p.slug} href={`/blog/${p.slug}`} kicker={p.category} title={p.h1} text={p.excerpt} />
            ))}
          </ul>
        </section>
        {compares.length > 0 && (
          <section className={m.group} aria-labelledby="compare">
            <h2 id="compare">Comparisons</h2>
            <ul className={m.cards}>
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
