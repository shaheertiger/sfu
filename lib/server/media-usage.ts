import 'server-only';
import { query } from './db';
import { summarizeUsage } from '../media-usage.js';

export type PlatformUsage = { published: number; scheduled: number; last: number | null };
export type MediaUsage = { posts: number; drafts: number; last: number | null; platforms: Record<string, PlatformUsage> };

/**
 * Where every file in the workspace's library has been used: one row per (file, post, target),
 * folded by summarizeUsage into counts per platform plus the last time it was published.
 * A target's own published_at wins; a post still in the queue carries its scheduled time.
 */
export async function mediaUsage(workspaceId: string): Promise<Record<string, MediaUsage>> {
  const rows = await query(
    `SELECT m.id, p.id AS post_id, a.platform, t.status AS target_status, p.status AS post_status,
            COALESCE(t.published_at, p.scheduled_at) AS at
       FROM posts p
       CROSS JOIN LATERAL jsonb_array_elements_text(p.media) AS m(id)
       LEFT JOIN post_targets t ON t.post_id = p.id
       LEFT JOIN social_accounts a ON a.id = t.account_id
      WHERE p.workspace_id = $1`,
    [workspaceId],
  );
  return summarizeUsage(rows);
}
