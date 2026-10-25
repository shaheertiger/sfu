import { handler } from '@/lib/server/api';
import { query } from '@/lib/server/db';
import { feedRow } from '@/lib/server/rss';
import { webhookRow } from '@/lib/server/webhook-row';
import { linkTotals } from '@/lib/server/links';
import { calendarToken, calendarUrls } from '@/lib/server/calendar';
import { referralSummary } from '@/lib/server/referrals';
import { bookmarklet } from '@/lib/share-caption';
import { appUrl } from '@/lib/server/url';

export const dynamic = 'force-dynamic';

/** Everything the Automations page shows, in one request. */
export const GET = handler(async ({ req, workspace }) => {
  const [hooks, feeds, accounts, ws, links, calToken, referral] = await Promise.all([
    query('SELECT * FROM webhooks WHERE workspace_id=$1 ORDER BY created_at', [workspace.id]),
    query('SELECT * FROM rss_feeds WHERE workspace_id=$1 ORDER BY created_at', [workspace.id]),
    query(`SELECT id, platform, username, display_name, NULLIF(TRIM(meta->>'default_first_comment'), '') AS default_first_comment FROM social_accounts WHERE workspace_id=$1 ORDER BY platform, username`, [workspace.id]),
    query('SELECT signature FROM workspaces WHERE id=$1', [workspace.id]),
    linkTotals(workspace.id),
    calendarToken(workspace.id),
    referralSummary(workspace.id, workspace.plan, req),
  ]);
  return {
    workspace: { id: workspace.id, name: workspace.name, role: workspace.role },
    signature: ws[0]?.signature || '',
    track_links: workspace.prefs?.trackLinks === true,
    utm_tags: workspace.prefs?.utm === true,
    link_clicks: links.clicks,
    tracked_links: links.links,
    calendar: { enabled: !!calToken, ...(calToken ? calendarUrls(calToken) : { url: null, ics_url: null }) },
    webhooks: hooks.map((h) => webhookRow(h)),
    feeds: feeds.map(feedRow),
    accounts,
    referral,
    share: { bookmarklet: bookmarklet(appUrl(req)), app_url: `${appUrl(req)}/app` },
  };
});
