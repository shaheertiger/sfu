import { body, handler, json } from '@/lib/server/api';
import { deletePost, getPost, parsePostBody, savePost, validatePost } from '@/lib/server/posts';
import { requireCanPublish } from '@/lib/server/billing';
import { claimAndPublish } from '@/lib/server/publish-now';
import { one } from '@/lib/server/db';

export const maxDuration = 300;

/**
 * Dashboard sync: create-or-replace a post under the id the browser chose.
 * With `publish_now: true` the post is saved and published in this request. The plan is checked
 * before anything is saved, so a refused publish (402) leaves no post queued in the past.
 */
export const PUT = handler(async ({ req, workspace, user, params }) => {
  if (!/^[\w-]{1,64}$/.test(params.id)) return json({ error: 'Bad post id' }, 400);
  const elsewhere = await one('SELECT workspace_id FROM posts WHERE id=$1', [params.id]);
  if (elsewhere && elsewhere.workspace_id !== workspace.id) return json({ error: 'Post id already in use' }, 409);
  const b = parsePostBody(await body(req));
  if (b.publish_now) {
    if (b.status === 'draft') return json({ error: 'publish_now cannot be combined with status "draft"' }, 422);
    if (b.approval === 'pending') return json({ error: 'Approve this post before publishing it' }, 409);
    const existing = await getPost(workspace.id, params.id);
    if (existing?.status === 'published') return json({ error: 'This post is already published' }, 409);
    if (existing?.status === 'publishing') return json({ error: 'This post is publishing right now' }, 409);
    await requireCanPublish(workspace.id);
    b.status = 'scheduled';
  }
  if (b.status === 'scheduled') {
    const errors = await validatePost(workspace.id, b);
    if (errors.length) return json({ error: errors.join('; '), errors }, 422);
  }
  const post = await savePost(workspace.id, { ...b, id: params.id }, user?.id ?? null);
  if (!b.publish_now) return { post };
  const status = await claimAndPublish(post.id);
  return { status, post: await getPost(workspace.id, post.id) };
}, { sessionOnly: true });

export const DELETE = handler(async ({ workspace, params }) => {
  await deletePost(workspace.id, params.id);
  return { ok: true };
}, { sessionOnly: true });
