import { siteUrl } from '@/lib/site';
import { getComparisons, getContentPage, getPlatformPages, getPosts, getStaticPage, getToolPages } from '@/lib/content';
import { PLATFORM_PAGES } from '@/lib/platform-pages';
import { LANDING_PAGES } from '@/lib/landing-pages';
import { toolBySlug } from '@/lib/tools/registry';

/** Public pages worth indexing. Signed-in pages, previews and utility pages are left out on purpose. */
export default function sitemap() {
  const base = siteUrl();
  const posts = getPosts();
  const latest = (list) => list.reduce((d, p) => (p.date > d ? p.date : d), '2026-01-01');
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.8 },
    ...PLATFORM_PAGES.filter((p) => getPlatformPages().some((c) => c.slug === p.slug)).map((p) => ({ url: `${base}/${p.slug}`, changeFrequency: 'monthly', priority: 0.8 })),
    ...(getStaticPage('about') ? [{ url: `${base}/about`, changeFrequency: 'yearly', priority: 0.4 }] : []),
    ...LANDING_PAGES.filter((p) => getContentPage(p.slug)).map((p) => ({ url: `${base}/${p.slug}`, changeFrequency: 'monthly', priority: p.slug === 'pricing' ? 0.9 : 0.7 })),
    { url: `${base}/tools`, changeFrequency: 'weekly', priority: 0.8 },
    ...getToolPages()
      .filter((p) => toolBySlug(p.slug))
      .map((p) => ({ url: `${base}/tools/${p.slug}`, changeFrequency: 'monthly', priority: 0.7 })),
    { url: `${base}/blog`, lastModified: latest(posts), changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updated || p.date, changeFrequency: 'monthly', priority: 0.6 })),
    { url: `${base}/compare`, changeFrequency: 'monthly', priority: 0.5 },
    ...getComparisons().map((c) => ({ url: `${base}/compare/${c.aSlug}/${c.bSlug}`, lastModified: c.updated || c.date, changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
