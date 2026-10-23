import { notFound } from 'next/navigation';
import Article from '@/components/marketing/Article';
import { getComparison, getComparisons, getPosts } from '@/lib/content';
import { pageMetadata } from '@/lib/seo-pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return getComparisons().map((c) => ({ a: c.aSlug, b: c.bSlug }));
}

export async function generateMetadata({ params }) {
  const { a, b } = await params;
  const c = getComparison(a, b);
  if (!c) return {};
  const path = `/compare/${a}/${b}`;
  return pageMetadata({ title: c.title, description: c.description, path, type: 'article', absolute: true, keyword: c.keyword, publishedTime: c.date });
}

export default async function ComparePage({ params }) {
  const { a, b } = await params;
  const c = getComparison(a, b);
  if (!c) notFound();
  const path = `/compare/${a}/${b}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: `${c.a} vs. ${c.b}`, href: path },
  ];
  const others = getComparisons()
    .filter((x) => x.slug !== c.slug)
    .map((x) => ({ href: `/compare/${x.aSlug}/${x.bSlug}`, name: x.h1, kicker: 'Comparison' }));
  const hoot = getPosts().find((p) => p.slug === 'free-hootsuite-alternative');
  const related = [...others, ...(hoot ? [{ href: `/blog/${hoot.slug}`, name: hoot.h1, kicker: hoot.category }] : [])];
  return <Article post={c} path={path} crumbs={crumbs} related={related} />;
}
