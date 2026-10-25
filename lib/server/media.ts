import 'server-only';
import { readUrl } from './storage';
import { appUrl } from './url';

/** Image types the thumbnail route resizes. GIFs stay as they are (resizing drops the animation). */
const THUMB_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const THUMB_WIDTH = 640;
/** Video posters are JPEG stills the browser makes; this is their size cap in bytes. */
export const POSTER_MAX_BYTES = 2_000_000;
export const posterKeyFor = (objectKey: string) => `${objectKey}.poster.jpg`;

/**
 * A small, cached version of an image for cards and tiles. Originals are up to 20 MB and were being
 * loaded as thumbnails, which made the queue and library slow. The URL goes through Next's image
 * optimizer, which fetches the original once from /m/<id>, resizes it and caches the result at the
 * edge; later views are a few kilobytes. A video has one only once it has a poster still; GIFs never.
 */
export function thumbUrlFor(id: string, mime: string, base = appUrl(), hasPoster = false): string | null {
  if (!THUMB_MIMES.has(mime) && !(mime.startsWith('video/') && hasPoster)) return null;
  return `${base}/_next/image?url=${encodeURIComponent(`/m/${id}`)}&w=${THUMB_WIDTH}&q=75`;
}

export async function publicMedia(m: any) {
  return {
    id: m.id,
    filename: m.filename,
    mime: m.mime,
    size: m.size,
    folder: m.folder,
    created_at: m.created_at,
    url: await readUrl(m.object_key, 3600),
    thumb_url: thumbUrlFor(m.id, m.mime, appUrl(), !!m.poster_key),
    poster: !!m.poster_key,
  };
}
