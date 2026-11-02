import 'server-only';
import { exec } from '@/lib/server/db';
import { composeObject, getBytes, getRange, head, putBytes, type ComposePart } from '@/lib/server/storage';
import { stripMetadata } from '@/lib/tools/exif';
import { composeParts, planVideo, scrubVideoRegion, videoFormatForMime } from '@/lib/tools/video-meta';

/** Image formats the stripper rewrites losslessly. GIFs carry no EXIF; HEIC is converted in the browser. */
const STRIPPABLE = new Set(['image/jpeg', 'image/png', 'image/webp']);
/** Videos up to this size are rewritten with one GET and one PUT; above it the object is recomposed server side. */
const WHOLE_FILE_LIMIT = 32 * 1024 * 1024;
const MIN_PART = 5 * 1024 * 1024;

export type StripResult = { stripped: boolean; hadGps: boolean; hadAny: boolean; size: number | null; skipped?: string };

/** Whether a workspace strips metadata: on unless the owner turned it off in Settings. */
export const stripsMetadata = (prefs: any) => prefs?.stripMetadata !== false;

const none = (skipped: string): StripResult => ({ stripped: false, hadGps: false, hadAny: false, size: null, skipped });

async function mark(id: string, hadGps: boolean, size?: number) {
  if (size === undefined) await exec('UPDATE media SET metadata_stripped=true, metadata_had_gps=$2 WHERE id=$1', [id, hadGps]);
  else await exec('UPDATE media SET size=$2, metadata_stripped=true, metadata_had_gps=$3 WHERE id=$1', [id, size, hadGps]);
}

/**
 * Removes EXIF, GPS, XMP, IPTC and comment blocks from a freshly confirmed upload and writes the
 * clean file back under the same key, so every later use (queue, preview links, every platform)
 * gets the clean bytes. Lossless: pixels are copied byte for byte and a JPEG's Orientation is kept
 * so the photo stays the right way up. Videos go through stripVideoMetadata. Never throws: a
 * storage or parse error leaves the original in place and is logged, because an upload that
 * works beats a privacy feature that blocks it.
 */
export async function stripUploadMetadata(media: { id: string; object_key: string; mime: string }): Promise<StripResult> {
  if (videoFormatForMime(media.mime)) return stripVideoMetadata(media);
  if (!STRIPPABLE.has(media.mime)) return none('format');
  try {
    const original = await getBytes(media.object_key);
    const r = stripMetadata(new Uint8Array(original));
    if (!r.changed) {
      await mark(media.id, r.hadGps);
      return { stripped: true, hadGps: r.hadGps, hadAny: r.hadAny, size: original.length };
    }
    await putBytes(media.object_key, r.bytes, media.mime);
    await mark(media.id, r.hadGps, r.bytes.length);
    return { stripped: true, hadGps: r.hadGps, hadAny: r.hadAny, size: r.bytes.length };
  } catch (e) {
    console.error('[media-privacy]', media.id, (e as Error)?.message || e);
    return none('error');
  }
}

/**
 * Scrubs an MP4/MOV or WebM in place without re-encoding: the metadata boxes are located with a
 * handful of ranged reads, zeroed, and written back. Small files are rewritten whole; large ones
 * are recomposed from server-side copies of the untouched ranges plus the patched ranges, so the
 * video itself never leaves the bucket. The file keeps its exact length, so sample offsets stay valid.
 */
export async function stripVideoMetadata(media: { id: string; object_key: string; mime: string }): Promise<StripResult> {
  const format = videoFormatForMime(media.mime);
  if (!format) return none('format');
  const key = media.object_key;
  try {
    const h = await head(key);
    if (!h) return none('missing');
    const size = h.size;
    const read = (start: number, length: number) => getRange(key, start, length);
    const plan = await planVideo(format, size, read);
    if (!plan.ok) {
      console.warn('[media-privacy] video skipped', media.id, plan.reason);
      return none(plan.reason || 'unsupported');
    }
    let hadGps = false;
    let hadAny = false;
    const patches: { start: number; end: number; bytes: Uint8Array }[] = [];
    for (const region of plan.regions) {
      const bytes = await read(region.start, region.end - region.start);
      const r = scrubVideoRegion(format, bytes);
      hadGps = hadGps || r.hadGps;
      hadAny = hadAny || r.hadAny;
      if (r.changed) patches.push({ start: region.start, end: region.end, bytes: r.bytes });
    }
    if (!patches.length) {
      await mark(media.id, hadGps);
      return { stripped: true, hadGps, hadAny, size };
    }
    if (size <= WHOLE_FILE_LIMIT) {
      const whole = new Uint8Array(await getBytes(key));
      for (const p of patches) whole.set(p.bytes, p.start);
      await putBytes(key, whole, media.mime);
    } else {
      const parts: ComposePart[] = [];
      for (const part of composeParts(size, patches, MIN_PART)) {
        if ('copy' in part) parts.push({ copy: part.copy as [number, number] });
        else {
          const [s, e] = part.range as [number, number];
          const bytes = await read(s, e - s);
          for (const p of patches) if (p.start >= s && p.end <= e) bytes.set(p.bytes, p.start - s);
          parts.push({ bytes });
        }
      }
      await composeObject(key, media.mime, parts);
    }
    await mark(media.id, hadGps, size);
    return { stripped: true, hadGps, hadAny, size };
  } catch (e) {
    console.error('[media-privacy] video', media.id, (e as Error)?.message || e);
    return none('error');
  }
}
