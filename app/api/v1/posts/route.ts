import { body, handler, json } from '@/lib/server/api';
import { getPost, listPosts, parsePostBody, savePost, validatePost } from '@/lib/server/posts';
import { claimAndPublish } from '@/lib/server/publish-now';

export const maxDuration = 300;

export const GET = handler(async ({ req, workspace }) => {
  const u = new URL(req.url);
  const num = (k: string) => {
    const v = u.searchParams.get(k);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return { posts: await listPosts(workspace.id, { status: u.searchParams.get('status') || undefined, from: num('from'), to: num('to'), limit: num('limit') }) };
});

/** Create a post. Accepts `account_ids` instead of `targets` and ISO dates for `scheduled_at`. */
export const POST = handler(async ({ req, workspace, user }) => {
  const b = parsePostBody(await body(req));
  const errors = await validatePost(workspace.id, b);
  if (errors.length && b.status !== 'draft' && !b.force) return json({ error: errors.join('; '), errors }, 422);
  const post = await savePost(workspace.id, b, user?.id ?? null);
  if (b.publish_now) await claimAndPublish(post.id);
  return json({ post: await getPost(workspace.id, post.id) }, 201);
});
