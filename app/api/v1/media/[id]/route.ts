import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { exec, one } from '@/lib/server/db';
import { head, remove } from '@/lib/server/storage';
import { publicMedia } from '@/lib/server/media';

export const PATCH = handler(async ({ req, workspace, params }) => {
  const m = await one('SELECT * FROM media WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  if (!m) return json({ error: 'Not found' }, 404);
  const b = z.object({ uploaded: z.literal(true).optional(), folder: z.string().max(80).nullable().optional() }).parse(await body(req));
  if (b.uploaded) {
    const h = await head(m.object_key);
    if (!h) return json({ error: 'Upload not found in storage. Try uploading again.' }, 409);
    await exec('UPDATE media SET uploaded=true, size=$1 WHERE id=$2', [h.size, m.id]);
  }
  if (b.folder !== undefined) await exec('UPDATE media SET folder=$1 WHERE id=$2', [b.folder, m.id]);
  return { media: await publicMedia(await one('SELECT * FROM media WHERE id=$1', [m.id])) };
});

export const DELETE = handler(async ({ workspace, params }) => {
  const m = await one('SELECT * FROM media WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  if (!m) return json({ error: 'Not found' }, 404);
  await remove(m.object_key).catch(() => {});
  await exec('DELETE FROM media WHERE id=$1', [m.id]);
  return { ok: true };
});
