import { notFound } from 'next/navigation';
import BestTimePage, { loadBestTimePage } from '@/components/marketing/BestTimePage';
import { allBestTimePages, pagePath } from '@/lib/best-time-pages';
import { pageMetadata } from '@/lib/seo-pages';

/** /best-time-to-post/instagram/monday and /best-time-to-post/instagram/in-india. */
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return allBestTimePages().filter((p) => p.segment).map((p) => ({ platform: p.platform, segment: p.segment }));
}

export async function generateMetadata({ params }) {
  const { platform, segment } = await params;
  const page = await loadBestTimePage(platform, segment);
  if (!page) return {};
  return pageMetadata({ title: page.copy.title, description: page.copy.description, path: pagePath(platform, segment), absolute: true, keyword: page.copy.keyword });
}

export default async function Page({ params }) {
  const { platform, segment } = await params;
  const page = await loadBestTimePage(platform, segment);
  if (!page) notFound();
  return <BestTimePage page={page} segment={segment} />;
}
