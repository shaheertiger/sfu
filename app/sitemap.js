import { siteUrl } from '@/lib/site';

export default function sitemap() {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/demo`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
