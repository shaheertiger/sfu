import { handler, json } from '@/lib/server/api';
import { one } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';
import { checkFeed, feedRow, getFeed } from '@/lib/server/rss';

/** Checks a feed now instead of waiting for the next 15-minute run. */
export const POST = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  const f = await getFeed(workspace.id, params.id);
  if (!f) return json({ error: 'Not found' }, 404);
  const created = await checkFeed(f);
  return { created, feed: feedRow(await one('SELECT * FROM rss_feeds WHERE id=$1', [f.id])) };
});
