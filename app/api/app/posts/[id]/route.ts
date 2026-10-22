import { body, handler, json } from '@/lib/server/api';
import { deletePost, savePost, validatePost } from '@/lib/server/posts';
import { one } from '@/lib/server/db';

/** Dashboard sync: create-or-replace a post under the id the browser chose. */
export const PUT = handler(async ({ req, workspace, user, params }) => {
  if (!/^[\w-]{1,64}$/.test(params.id)) return json({ error: 'Bad post id' }, 400);
  const elsewhere = await one('SELECT workspace_id FROM posts WHERE id=$1', [params.id]);
  if (elsewhere && elsewhere.workspace_id !== workspace.id) return json({ error: 'Post id already in use' }, 409);
  const b = await body<any>(req);
  if (b.status === 'scheduled') {
    const errors = await validatePost(workspace.id, b);
    if (errors.length) return json({ error: errors.join('; '), errors }, 422);
  }
  return { post: await savePost(workspace.id, { ...b, id: params.id }, user?.id ?? null) };
}, { sessionOnly: true });

export const DELETE = handler(async ({ workspace, params }) => {
  await deletePost(workspace.id, params.id);
  return { ok: true };
}, { sessionOnly: true });
