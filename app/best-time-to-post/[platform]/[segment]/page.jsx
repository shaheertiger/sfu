import { notFound } from 'next/navigation';
import BestTimePage, { loadBestTimePage } from '@/components/marketing/BestTimePage';
import BestTimeSocialPage, { loadSocialPage } from '@/components/marketing/BestTimeSocialPage';
import { SOCIAL, allBestTimePages, pagePath } from '@/lib/best-time-pages';
import { pageMetadata } from '@/lib/seo-pages';

/**
 * /best-time-to-post/instagram/monday, /best-time-to-post/instagram/in-india and
 * /best-time-to-post/social-media/in-india (every platform in one country).
 */
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return allBestTimePages().filter((p) => p.segment).map((p) => ({ platform: p.platform, segment: p.segment }));
}

const social = (platform, segment) => (platform === SOCIAL && segment.startsWith('in-') ? segment.slice(3) : null);

export async function generateMetadata({ params }) {
  const { platform, segment } = await params;
  const country = social(platform, segment);
  const page = country ? await loadSocialPage(country) : await loadBestTimePage(platform, segment);
  if (!page) return {};
  return pageMetadata({ title: page.copy.title, description: page.copy.description, path: pagePath(platform, segment), absolute: true, keyword: page.copy.keyword });
}

export default async function Page({ params }) {
  const { platform, segment } = await params;
  const country = social(platform, segment);
  if (country) {
    const page = await loadSocialPage(country);
    if (!page) notFound();
    return <BestTimeSocialPage page={page} />;
  }
  const page = await loadBestTimePage(platform, segment);
  if (!page) notFound();
  return <BestTimePage page={page} segment={segment} />;
}
