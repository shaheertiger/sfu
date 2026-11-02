import { notFound } from 'next/navigation';
import BestTimePage, { loadBestTimePage } from '@/components/marketing/BestTimePage';
import { BEST_TIME_PLATFORMS } from '@/lib/best-time';
import { pagePath } from '@/lib/best-time-pages';
import { pageMetadata } from '@/lib/seo-pages';

/** /best-time-to-post/instagram … one page per platform, re-rendered daily from the stats table. */
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return BEST_TIME_PLATFORMS.map((p) => ({ platform: p.slug }));
}

export async function generateMetadata({ params }) {
  const { platform } = await params;
  const page = await loadBestTimePage(platform, '');
  if (!page) return {};
  return pageMetadata({ title: page.copy.title, description: page.copy.description, path: pagePath(platform), absolute: true, keyword: page.copy.keyword });
}

export default async function Page({ params }) {
  const { platform } = await params;
  const page = await loadBestTimePage(platform, '');
  if (!page) notFound();
  return <BestTimePage page={page} segment="" />;
}
