import { indexXml, sitemapFamilies } from '@/lib/sitemap';

export const dynamic = 'force-static';
export const revalidate = 86400;

/** The sitemap index: one file per page family and per language (lib/sitemap.js). */
export const GET = () => new Response(indexXml(sitemapFamilies()), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
