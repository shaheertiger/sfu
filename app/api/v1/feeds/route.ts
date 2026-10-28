import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { now, one, query, uid } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';
import { requirePaid } from '@/lib/server/billing';
import { checkFeed, feedRow, fetchFeed } from '@/lib/server/rss';

export const Feed = z.object({
  url: z.string().max(2000),
  mode: z.enum(['draft', 'queue']).default('draft'),
  template: z.string().min(1).max(2000).default('{title}\n\n{link}'),
  account_ids: z.array(z.string()).max(100).default([]),
});

export const GET = handler(async ({ workspace }) => ({
  feeds: (await query('SELECT * FROM rss_feeds WHERE workspace_id=$1 ORDER BY created_at', [workspace.id])).map(feedRow),
}));

/** Adds a feed. It is read once right away, so a wrong URL fails here instead of silently later. */
export const POST = handler(async ({ req, workspace }) => {
  requireEditor(workspace);
  requirePaid(workspace, 'rss');
  const b = Feed.parse(await body(req));
  const count = (await one('SELECT count(*)::int AS n FROM rss_feeds WHERE workspace_id=$1', [workspace.id])).n;
  if (count >= 20) return json({ error: 'A workspace can have up to 20 feeds' }, 400);
  try {
    await fetchFeed(b.url.trim());
  } catch (e: any) {
    return json({ error: e?.message || 'Could not read that feed' }, e?.status || 400);
  }
  const valid = new Set((await query('SELECT id FROM social_accounts WHERE workspace_id=$1', [workspace.id])).map((r) => r.id));
  const id = uid('feed');
  await query('INSERT INTO rss_feeds (id, workspace_id, url, mode, template, account_ids, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [
    id, workspace.id, b.url.trim(), b.mode, b.template, JSON.stringify(b.account_ids.filter((a) => valid.has(a))), now(),
  ]);
  // First read: remembers the items already in the feed (they are not posted).
  await checkFeed(await one('SELECT * FROM rss_feeds WHERE id=$1', [id]), true);
  return json({ feed: feedRow(await one('SELECT * FROM rss_feeds WHERE id=$1', [id])) }, 201);
});
