import { body, handler, json } from '@/lib/server/api';
import { getPost, listPosts, savePost, validatePost } from '@/lib/server/posts';
import { claimAndPublish } from '@/lib/server/publish-now';

export const GET = handler(async ({ req, workspace }) => {
  const u = new URL(req.url);
  const num = (k: string) => (u.searchParams.get(k) ? Number(u.searchParams.get(k)) : undefined);
  return { posts: await listPosts(workspace.id, { status: u.searchParams.get('status') || undefined, from: num('from'), to: num('to'), limit: num('limit') }) };
});

export const POST = handler(async ({ req, workspace, user }) => {
  const b = await body<any>(req);
  // API conveniences: account_ids instead of targets, ISO dates.
  if (!b.targets && Array.isArray(b.account_ids)) b.targets = b.account_ids.map((account_id: string) => ({ account_id }));
  if (typeof b.scheduled_at === 'string') b.scheduled_at = Date.parse(b.scheduled_at);
  delete b.id;
  const errors = await validatePost(workspace.id, b);
  if (errors.length && b.status !== 'draft' && !b.force) return json({ error: errors.join('; '), errors }, 422);
  const post = await savePost(workspace.id, b, user?.id ?? null);
  if (b.publish_now) await claimAndPublish(post.id);
  return json({ post: await getPost(workspace.id, post.id) }, 201);
});
