import { handler } from '@/lib/server/api';
import { query } from '@/lib/server/db';
import { feedRow } from '@/lib/server/rss';
import { webhookRow } from '@/lib/server/webhook-row';

export const dynamic = 'force-dynamic';

/** Everything the Automations page shows, in one request. */
export const GET = handler(async ({ workspace }) => {
  const [hooks, feeds, accounts, ws] = await Promise.all([
    query('SELECT * FROM webhooks WHERE workspace_id=$1 ORDER BY created_at', [workspace.id]),
    query('SELECT * FROM rss_feeds WHERE workspace_id=$1 ORDER BY created_at', [workspace.id]),
    query('SELECT id, platform, username, display_name FROM social_accounts WHERE workspace_id=$1 ORDER BY platform, username', [workspace.id]),
    query('SELECT signature FROM workspaces WHERE id=$1', [workspace.id]),
  ]);
  return {
    workspace: { id: workspace.id, name: workspace.name, role: workspace.role },
    signature: ws[0]?.signature || '',
    webhooks: hooks.map((h) => webhookRow(h)),
    feeds: feeds.map(feedRow),
    accounts,
  };
});
