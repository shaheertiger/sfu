import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { now, query, uid } from '@/lib/server/db';
import { presignUpload } from '@/lib/server/storage';
import { publicMedia } from '@/lib/server/media';

const TYPES: Record<string, number> = {
  'image/jpeg': 20e6, 'image/png': 20e6, 'image/gif': 15e6, 'image/webp': 20e6,
  'video/mp4': 1e9, 'video/quicktime': 1e9, 'video/webm': 1e9,
};

export const GET = handler(async ({ workspace }) => {
  const rows = await query('SELECT * FROM media WHERE workspace_id=$1 AND uploaded ORDER BY created_at DESC LIMIT 500', [workspace.id]);
  return { media: await Promise.all(rows.map(publicMedia)) };
});

/** Step 1 of an upload: returns a presigned URL the browser PUTs the file to. Then PATCH /media/:id {uploaded:true}. */
export const POST = handler(async ({ req, workspace }) => {
  const b = z.object({ filename: z.string().min(1).max(200), mime: z.string(), size: z.number().int().positive(), folder: z.string().max(80).nullish() }).parse(await body(req));
  const limit = TYPES[b.mime];
  if (!limit) return json({ error: `Unsupported file type ${b.mime}. Use JPG, PNG, GIF, WebP, MP4, MOV or WebM.` }, 415);
  if (b.size > limit) return json({ error: `${b.filename} is too large (max ${Math.round(limit / 1e6)} MB)` }, 413);
  const id = uid('med');
  const safe = b.filename.replace(/[^\w.\-]+/g, '-').slice(-100);
  const key = `${workspace.id}/${id}/${safe}`;
  await query('INSERT INTO media (id,workspace_id,filename,object_key,mime,size,folder,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, workspace.id, b.filename, key, b.mime, b.size, b.folder ?? null, now()]);
  return json({ id, upload_url: await presignUpload(key, b.mime, b.size), headers: { 'content-type': b.mime } }, 201);
});
