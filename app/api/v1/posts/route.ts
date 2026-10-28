import { body, handler, json } from '@/lib/server/api';
import { HttpError } from '@/lib/server/http-error';
import { getPost, listPosts, parsePostBody, publicPost, savePost, validatePost } from '@/lib/server/posts';
import { claimAndPublish } from '@/lib/server/publish-now';
import { now } from '@/lib/server/db';

export const maxDuration = 300;

export const GET = handler(async ({ req, workspace }) => {
  const u = new URL(req.url);
  // Numbers are epoch milliseconds; `from` and `to` also take ISO 8601 dates.
  const num = (k: string, dates = false) => {
    const v = u.searchParams.get(k);
    if (!v) return undefined;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
    if (!dates) return undefined;
    const t = Date.parse(v);
    if (Number.isNaN(t)) throw new HttpError(400, `${k} must be an ISO 8601 date or epoch milliseconds`);
    return t;
  };
  const posts = await listPosts(workspace.id, { status: u.searchParams.get('status') || undefined, from: num('from', true), to: num('to', true), limit: num('limit') });
  return { posts: posts.map(publicPost) };
});

/** Create a post. Accepts `account_ids` instead of `targets` and ISO dates for `scheduled_at`. */
export const POST = handler(async ({ req, workspace, user }) => {
  const b = parsePostBody(await body(req));
  if (b.publish_now) {
    if (b.status === 'draft') return json({ error: 'publish_now cannot be combined with status "draft"' }, 422);
    if (b.approval === 'pending') return json({ error: 'A post waiting for approval cannot be published now. Approve it first, or leave out publish_now.' }, 409);
    b.status = 'scheduled';
    b.scheduled_at = now();
  } else if (b.status === 'scheduled' && b.scheduled_at == null) {
    return json({ error: 'scheduled_at is required when status is "scheduled"' }, 422);
  }
  const errors = await validatePost(workspace.id, b);
  if (errors.length && b.status !== 'draft' && !b.force) return json({ error: errors.join('; '), errors }, 422);
  const post = await savePost(workspace.id, b, user?.id ?? null);
  if (b.publish_now) await claimAndPublish(post.id);
  return json({ post: publicPost(await getPost(workspace.id, post.id)) }, 201);
});
