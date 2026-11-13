import { familyXml, sitemapFamilies } from '@/lib/sitemap';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sitemapFamilies()).map((name) => ({ file: `${name}.xml` }));
}

/** One family of the sitemap: /sitemaps/blog.xml, /sitemaps/lang-de.xml (lib/sitemap.js). */
export async function GET(_req, { params }) {
  const { file } = await params;
  const entries = sitemapFamilies()[String(file).replace(/\.xml$/, '')];
  if (!entries) return new Response('Not found\n', { status: 404 });
  return new Response(familyXml(entries), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
}
