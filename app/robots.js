import { siteUrl } from '@/lib/site';

/** Public pages may be indexed; the signed-in app, API and preview links may not. */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: ['/', '/signup', '/login', '/demo'], disallow: ['/app', '/api/', '/p/', '/invite/', '/brand'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
