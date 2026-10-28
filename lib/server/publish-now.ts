import 'server-only';
import { now, query } from './db';
import { REQUEST_PUBLISH_MS, publishPost } from './publisher';

/**
 * Claims one post (unless a cron run already has it) and publishes it in this request. Publishing
 * stops in time for the request to answer; targets it didn't get to stay queued for the scheduler.
 */
export async function claimAndPublish(postId: string) {
  const claimed = await query(`UPDATE posts SET status='publishing', updated_at=$1 WHERE id=$2 AND status='scheduled' RETURNING id`, [now(), postId]);
  if (!claimed.length) return 'publishing';
  return publishPost(postId, { deadline: now() + REQUEST_PUBLISH_MS });
}
