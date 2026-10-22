import { handler, json } from '@/lib/server/api';
import { exec, now } from '@/lib/server/db';
import { getPost } from '@/lib/server/posts';
import { claimAndPublish } from '@/lib/server/publish-now';

export const maxDuration = 300;

/** Publish now: a draft, a scheduled post, or a retry of failed targets. */
export const POST = handler(async ({ workspace, params }) => {
  const post = await getPost(workspace.id, params.id);
  if (!post) return json({ error: 'Not found' }, 404);
  if (post.approval === 'pending') return json({ error: 'Approve this post before publishing it' }, 409);
  await exec(`UPDATE posts SET status='scheduled', scheduled_at=$1 WHERE id=$2 AND status <> 'publishing'`, [now(), post.id]);
  await exec(`UPDATE post_targets SET status='pending', attempts=0, error=NULL WHERE post_id=$1 AND status <> 'published'`, [post.id]);
  const status = await claimAndPublish(post.id);
  return { status, post: await getPost(workspace.id, post.id) };
});
