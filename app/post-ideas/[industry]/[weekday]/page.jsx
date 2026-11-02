import { notFound } from 'next/navigation';
import PostIdeasPage, { postIdeasCopy } from '@/components/marketing/PostIdeasPage';
import { WEEKDAYS, allPostIdeaPages, industryBySlug, postIdeasPath } from '@/lib/post-ideas';
import { pageMetadata } from '@/lib/seo-pages';

export const dynamicParams = false;
export function generateStaticParams() { return allPostIdeaPages().filter((p) => p.weekday); }
export async function generateMetadata({ params }) {
  const { industry, weekday } = await params; const ind = industryBySlug(industry);
  if (!ind || !WEEKDAYS.includes(weekday)) return {};
  const c = postIdeasCopy(ind, weekday);
  return pageMetadata({ title: c.title, description: c.description, path: postIdeasPath(industry, weekday), absolute: true, keyword: c.keyword });
}
export default async function Page({ params }) {
  const { industry, weekday } = await params; const ind = industryBySlug(industry);
  if (!ind || !WEEKDAYS.includes(weekday)) notFound();
  return <PostIdeasPage ind={ind} weekday={weekday} />;
}
