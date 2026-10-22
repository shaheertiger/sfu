import 'server-only';
import { now, query } from './db';
import { publishPost } from './publisher';
import { requireCanPublish } from './billing';

/** Claims one post (unless a cron run already has it) and publishes it in this request. */
export async function claimAndPublish(postId: string) {
  const post = (await query('SELECT workspace_id FROM posts WHERE id=$1', [postId]))[0];
  if (post) await requireCanPublish(post.workspace_id);
  const claimed = await query(`UPDATE posts SET status='publishing', updated_at=$1 WHERE id=$2 AND status='scheduled' RETURNING id`, [now(), postId]);
  if (!claimed.length) return 'publishing';
  return publishPost(postId);
}
