import { notFound } from 'next/navigation';
import Article from '@/components/marketing/Article';
import { getComparisons, getPosts, getStaticPage } from '@/lib/content';
import { pageMetadata } from '@/lib/seo-pages';

const PATH = '/later-alternative';

export function generateMetadata() {
  const p = getStaticPage('later-alternative');
  return p ? pageMetadata({ title: p.title, description: p.description, path: PATH, type: 'article', absolute: true, keyword: p.keyword, publishedTime: p.date }) : {};
}

export default function LaterAlternative() {
  const post = getStaticPage('later-alternative');
  if (!post) notFound();
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: 'Later alternative', href: PATH },
  ];
  const related = [
    ...getComparisons().map((c) => ({ href: `/compare/${c.aSlug}/${c.bSlug}`, name: c.h1, kicker: 'Comparison' })),
    ...getPosts()
      .filter((p) => ['free-hootsuite-alternative', 'best-social-media-scheduler-for-creators'].includes(p.slug))
      .map((p) => ({ href: `/blog/${p.slug}`, name: p.h1, kicker: p.category })),
  ];
  return <Article post={post} path={PATH} crumbs={crumbs} related={related} />;
}
