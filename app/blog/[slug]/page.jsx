import { notFound } from 'next/navigation';
import Article from '@/components/marketing/Article';
import { getPost, getPosts, getToolPage } from '@/lib/content';
import { platformOfPost, relatedPosts } from '@/lib/related';
import { TOOLS } from '@/lib/tools/registry';
import { pageMetadata } from '@/lib/seo-pages';
import { hreflangMap, translationsOf } from '@/lib/i18n-pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const path = `/blog/${slug}`;
  return pageMetadata({ title: post.title, description: post.description, path, type: 'article', keyword: post.keyword, publishedTime: post.date, section: post.category, languages: hreflangMap('blog', slug) });
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const path = `/blog/${slug}`;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.h1, href: path },
  ];
  const platform = platformOfPost(post);
  const related = relatedPosts(getPosts(), post, 3).map((p) => ({ href: `/blog/${p.slug}`, name: p.h1, kicker: p.category }));
  const tools = TOOLS.filter((t) => (platform === 'all' ? t.platform === 'all' : t.platform === platform))
    .slice(0, 4)
    .map((t) => ({ href: `/tools/${t.slug}`, name: getToolPage(t.slug)?.h1 || t.slug }));
  return <Article post={post} path={path} crumbs={crumbs} related={related} tools={tools} languages={translationsOf('blog', slug)} />;
}
