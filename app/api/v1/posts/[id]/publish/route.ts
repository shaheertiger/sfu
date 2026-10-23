import { handler, json } from '@/lib/server/api';
import { requireCanPublish } from '@/lib/server/billing';
import { exec, now } from '@/lib/server/db';
import { getPost, publicPost } from '@/lib/server/posts';
import { claimAndPublish } from '@/lib/server/publish-now';

export const maxDuration = 300;

/** Publish now: a draft, a scheduled post, or a retry of failed targets. */
export const POST = handler(async ({ workspace, params }) => {
  const post = await getPost(workspace.id, params.id);
  if (!post) return json({ error: 'Not found' }, 404);
  if (post.approval === 'pending') return json({ error: 'Approve this post before publishing it' }, 409);
  if (post.status === 'published') return json({ error: 'This post is already published' }, 409);
  if (post.status === 'publishing') return json({ error: 'This post is publishing right now' }, 409);
  if (!post.targets.length) return json({ error: 'Pick at least one account' }, 422);
  // Check the plan before touching the post, so a refused publish leaves it exactly as it was.
  await requireCanPublish(workspace.id);
  await exec(`UPDATE posts SET status='scheduled', scheduled_at=$1, updated_at=$1 WHERE id=$2 AND status <> 'publishing'`, [now(), post.id]);
  // Asked for by a person, so even a target that may have gone out is sent again.
  await exec(`UPDATE post_targets SET status='pending', attempts=0, error=NULL, progress='{}'::jsonb WHERE post_id=$1 AND status <> 'published'`, [post.id]);
  const status = await claimAndPublish(post.id);
  return { status, post: publicPost(await getPost(workspace.id, post.id)) };
});
