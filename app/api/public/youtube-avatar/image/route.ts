import { isYouTubeImage } from '@/lib/server/youtube-avatar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/youtube-avatar/image?u=<yt3 image URL>&name=<file name>
 * Streams a YouTube channel image back with a download header, so the PFP downloader's
 * "Download" button saves the file instead of opening it (browsers ignore `download` on
 * cross-origin links). Only YouTube's own image hosts are allowed.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const u = params.get('u') || '';
  if (!isYouTubeImage(u)) return new Response('Only YouTube channel images can be downloaded here.', { status: 400 });
  const name = (params.get('name') || 'youtube-profile-picture').replace(/[^\w.-]+/g, '-').slice(0, 80) || 'youtube-profile-picture';

  const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
  if (!res.ok || !res.body) return new Response('Image not available.', { status: 502 });
  const type = res.headers.get('content-type') || 'image/jpeg';
  if (!type.startsWith('image/')) return new Response('Not an image.', { status: 502 });
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  return new Response(res.body, {
    headers: {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${name}.${ext}"`,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
