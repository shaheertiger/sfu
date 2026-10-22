/**
 * IndexNow key file (https://www.indexnow.org). Bing (and the engines sharing IndexNow) fetch it
 * to confirm that URL submissions come from the site owner. Set INDEXNOW_KEY to enable;
 * `npm run seo:indexnow` submits the sitemap URLs.
 */
// Read at request time so the key can be set without a rebuild.
export const dynamic = 'force-dynamic';

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) return new Response('Not found', { status: 404 });
  return new Response(key, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
}
