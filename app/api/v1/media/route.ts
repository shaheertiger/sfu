import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { now, query, uid } from '@/lib/server/db';
import { presignUpload } from '@/lib/server/storage';
import { POSTER_MAX_BYTES, posterKeyFor, publicMedia } from '@/lib/server/media';
import { mediaUsage } from '@/lib/server/media-usage';

const TYPES: Record<string, number> = {
  'image/jpeg': 20e6, 'image/png': 20e6, 'image/gif': 15e6, 'image/webp': 20e6,
  'video/mp4': 1e9, 'video/quicktime': 1e9, 'video/webm': 1e9,
};

export const GET = handler(async ({ workspace }) => {
  const [rows, usage] = await Promise.all([
    query('SELECT * FROM media WHERE workspace_id=$1 AND uploaded ORDER BY created_at DESC LIMIT 500', [workspace.id]),
    mediaUsage(workspace.id),
  ]);
  // Each file says where it has been published and when it last went out, so a script can pick fresh ones.
  const empty = { posts: 0, drafts: 0, last: null, platforms: {} };
  return {
    media: await Promise.all(rows.map(async (m) => {
      const u = usage[m.id] || empty;
      return { ...(await publicMedia(m)), usage: { posts: u.posts, drafts: u.drafts, last_used_at: u.last, platforms: u.platforms } };
    })),
  };
});

/**
 * Step 1 of an upload: returns a presigned URL the browser PUTs the file to. Then PATCH /media/:id {uploaded:true}.
 * A video upload can bring a JPEG poster still (`poster_size`): the response then also carries
 * `poster_upload_url`, and the confirm step takes `poster: true`.
 */
export const POST = handler(async ({ req, workspace }) => {
  const b = z.object({
    filename: z.string().min(1).max(200), mime: z.string(), size: z.number().int().positive(), folder: z.string().max(80).nullish(),
    poster_size: z.number().int().positive().max(POSTER_MAX_BYTES).optional(),
  }).parse(await body(req));
  const limit = TYPES[b.mime];
  if (!limit) return json({ error: `Unsupported file type ${b.mime}. Use JPG, PNG, GIF, WebP, MP4, MOV or WebM.` }, 415);
  if (b.size > limit) return json({ error: `${b.filename} is too large (max ${Math.round(limit / 1e6)} MB)` }, 413);
  const id = uid('med');
  const safe = b.filename.replace(/[^\w.\-]+/g, '-').slice(-100);
  const key = `${workspace.id}/${id}/${safe}`;
  await query('INSERT INTO media (id,workspace_id,filename,object_key,mime,size,folder,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [id, workspace.id, b.filename, key, b.mime, b.size, b.folder ?? null, now()]);
  const poster = b.poster_size && b.mime.startsWith('video/') ? await presignUpload(posterKeyFor(key), 'image/jpeg', b.poster_size) : null;
  return json({ id, upload_url: await presignUpload(key, b.mime, b.size), headers: { 'content-type': b.mime }, ...(poster ? { poster_upload_url: poster } : {}) }, 201);
});
