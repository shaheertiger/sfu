import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { exec, one } from '@/lib/server/db';
import { head, presignUpload, remove } from '@/lib/server/storage';
import { POSTER_MAX_BYTES, posterKeyFor, publicMedia } from '@/lib/server/media';

/**
 * Confirms an upload, moves a file between folders, or adds a poster still to a video:
 * `poster_size` returns a presigned `poster_upload_url` for a JPEG; `poster: true` confirms it is there.
 */
export const PATCH = handler(async ({ req, workspace, params }) => {
  const m = await one('SELECT * FROM media WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  if (!m) return json({ error: 'Not found' }, 404);
  const b = z.object({
    uploaded: z.literal(true).optional(),
    folder: z.string().max(80).nullable().optional(),
    poster_size: z.number().int().positive().max(POSTER_MAX_BYTES).optional(),
    poster: z.literal(true).optional(),
  }).parse(await body(req));
  if (b.uploaded) {
    const h = await head(m.object_key);
    if (!h) return json({ error: 'Upload not found in storage. Try uploading again.' }, 409);
    await exec('UPDATE media SET uploaded=true, size=$1 WHERE id=$2', [h.size, m.id]);
  }
  if (b.folder !== undefined) await exec('UPDATE media SET folder=$1 WHERE id=$2', [b.folder, m.id]);
  let poster_upload_url: string | undefined;
  if (b.poster_size) {
    if (!m.mime.startsWith('video/')) return json({ error: 'Only videos take a poster still.' }, 400);
    poster_upload_url = await presignUpload(posterKeyFor(m.object_key), 'image/jpeg', b.poster_size);
  }
  if (b.poster) {
    const h = await head(posterKeyFor(m.object_key));
    if (!h) return json({ error: 'Poster not found in storage. Upload it again.' }, 409);
    await exec('UPDATE media SET poster_key=$1 WHERE id=$2', [posterKeyFor(m.object_key), m.id]);
  }
  return { media: await publicMedia(await one('SELECT * FROM media WHERE id=$1', [m.id])), ...(poster_upload_url ? { poster_upload_url } : {}) };
});

export const DELETE = handler(async ({ workspace, params }) => {
  const m = await one('SELECT * FROM media WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  if (!m) return json({ error: 'Not found' }, 404);
  await remove(m.object_key).catch(() => {});
  if (m.poster_key) await remove(m.poster_key).catch(() => {});
  await exec('DELETE FROM media WHERE id=$1', [m.id]);
  return { ok: true };
});
