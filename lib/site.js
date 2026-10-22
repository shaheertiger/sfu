/** Public site URL for metadata, robots and the sitemap. Server-side only (reads APP_URL / Vercel env). */
export function siteUrl() {
  const raw = process.env.APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') || 'https://scheduleforyou.com';
  return raw.replace(/\/$/, '');
}
