import { body, handler, json } from '@/lib/server/api';
import { deletePost, getPost, parsePostBody, savePost, validatePost } from '@/lib/server/posts';

export const GET = handler(async ({ workspace, params }) => {
  const post = await getPost(workspace.id, params.id);
  return post ? { post } : json({ error: 'Not found' }, 404);
});

export const PATCH = handler(async ({ req, workspace, user, params }) => {
  const existing = await getPost(workspace.id, params.id);
  if (!existing) return json({ error: 'Not found' }, 404);
  const b = parsePostBody(await body(req));
  if (b.targets && b.status !== 'draft') {
    const errors = await validatePost(workspace.id, { ...b, caption: b.caption ?? existing.caption, media: b.media ?? existing.media });
    if (errors.length && !b.force) return json({ error: errors.join('; '), errors }, 422);
  }
  return { post: await savePost(workspace.id, { ...b, id: params.id }, user?.id ?? null) };
});

export const DELETE = handler(async ({ workspace, params }) => {
  return (await deletePost(workspace.id, params.id)) ? { ok: true } : json({ error: 'Not found' }, 404);
});
