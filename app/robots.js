import { siteUrl } from '@/lib/site';

/** Public pages may be indexed; the signed-in app, API, preview and invite links may not. */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/app', '/api/', '/p/', '/invite/', '/brand', '/reset-password', '/l/', '/c/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
