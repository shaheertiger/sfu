import 'server-only';
import { exec } from '@/lib/server/db';
import { getBytes, putBytes } from '@/lib/server/storage';
import { stripMetadata } from '@/lib/tools/exif';

/** Formats the stripper rewrites losslessly. GIFs carry no EXIF; HEIC is converted in the browser; video is left alone. */
const STRIPPABLE = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type StripResult = { stripped: boolean; hadGps: boolean; hadAny: boolean; size: number | null; skipped?: string };

/** Whether a workspace strips metadata: on unless the owner turned it off in Settings. */
export const stripsMetadata = (prefs: any) => prefs?.stripMetadata !== false;

/**
 * Removes EXIF, GPS, XMP, IPTC and comment blocks from a freshly confirmed upload and writes the
 * clean file back under the same key, so every later use (queue, preview links, every platform)
 * gets the clean bytes. Lossless: pixels are copied byte for byte and a JPEG's Orientation is kept
 * so the photo stays the right way up. Never throws: a storage or parse error leaves the original
 * in place and is logged, because an upload that works beats a privacy feature that blocks it.
 */
export async function stripUploadMetadata(media: { id: string; object_key: string; mime: string }): Promise<StripResult> {
  if (!STRIPPABLE.has(media.mime)) return { stripped: false, hadGps: false, hadAny: false, size: null, skipped: 'format' };
  try {
    const original = await getBytes(media.object_key);
    const r = stripMetadata(new Uint8Array(original));
    if (!r.changed) {
      await exec('UPDATE media SET metadata_stripped=true, metadata_had_gps=$2 WHERE id=$1', [media.id, r.hadGps]);
      return { stripped: true, hadGps: r.hadGps, hadAny: r.hadAny, size: original.length };
    }
    await putBytes(media.object_key, r.bytes, media.mime);
    await exec('UPDATE media SET size=$2, metadata_stripped=true, metadata_had_gps=$3 WHERE id=$1', [media.id, r.bytes.length, r.hadGps]);
    return { stripped: true, hadGps: r.hadGps, hadAny: r.hadAny, size: r.bytes.length };
  } catch (e) {
    console.error('[media-privacy]', media.id, (e as Error)?.message || e);
    return { stripped: false, hadGps: false, hadAny: false, size: null, skipped: 'error' };
  }
}
