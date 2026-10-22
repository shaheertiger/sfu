import { siteUrl } from '@/lib/site';

/** Public pages worth indexing. Signed-in pages, previews and utility pages are left out on purpose. */
export default function sitemap() {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
