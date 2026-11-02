import { notFound } from 'next/navigation';
import PostIdeasPage, { postIdeasCopy } from '@/components/marketing/PostIdeasPage';
import { INDUSTRIES, industryBySlug, postIdeasPath } from '@/lib/post-ideas';
import { pageMetadata } from '@/lib/seo-pages';

export const dynamicParams = false;
export function generateStaticParams() { return INDUSTRIES.map((i) => ({ industry: i.slug })); }
export async function generateMetadata({ params }) {
  const { industry } = await params; const ind = industryBySlug(industry);
  if (!ind) return {};
  const c = postIdeasCopy(ind, '');
  return pageMetadata({ title: c.title, description: c.description, path: postIdeasPath(industry), absolute: true, keyword: c.keyword });
}
export default async function Page({ params }) {
  const { industry } = await params; const ind = industryBySlug(industry);
  if (!ind) notFound();
  return <PostIdeasPage ind={ind} />;
}
