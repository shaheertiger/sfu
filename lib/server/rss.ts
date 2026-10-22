import 'server-only';
import { parseFeed } from 'htmlparser2';
import { exec, now, one, query } from './db';
import { savePost } from './posts';
import { nextOpenSlot } from './publisher';
import { safeFetch } from './safe-url';

/**
 * RSS / Atom auto-post. The cron checks each feed every 15 minutes. The first check only records
 * what's already in the feed; after that each new item becomes a draft or a queued post (next open
 * posting slot) for the feed's accounts, built from the feed's template.
 * Template placeholders: {title} {link} {description}
 */
const INTERVAL = 15 * 60_000;
const MAX_NEW_PER_CHECK = 5;

const stripHtml = (s: string) =>
  s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

export function renderTemplate(template: string, item: { title?: string; link?: string; description?: string }) {
  const desc = stripHtml(item.description || '');
  return template
    .replace(/\{title\}/g, stripHtml(item.title || ''))
    .replace(/\{link\}/g, item.link || '')
    .replace(/\{description\}/g, desc.length > 280 ? desc.slice(0, 279).trimEnd() + '…' : desc)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function fetchFeed(url: string) {
  const res = await safeFetch(url, { headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5', 'user-agent': 'ScheduleForYou-RSS/1' } });
  if (!res.ok) throw new Error(`The feed answered HTTP ${res.status}`);
  const feed = parseFeed(res.text);
  if (!feed) throw new Error('That URL is not an RSS or Atom feed');
  const items = (feed.items || [])
    .map((i) => ({ guid: String(i.id || i.link || i.title || '').slice(0, 500), title: i.title, link: i.link, description: i.description, at: i.pubDate ? new Date(i.pubDate).getTime() : 0 }))
    .filter((i) => i.guid);
  return { title: feed.title || null, items };
}

/** Checks one feed. Returns how many posts it created. */
export async function checkFeed(feed: any, first = !feed.last_checked_at): Promise<number> {
  let created = 0;
  try {
    const { title, items } = await fetchFeed(feed.url);
    if (first) {
      // Remember what's already published so the feed's back catalogue isn't posted.
      for (const i of items) await exec('INSERT INTO rss_items (feed_id, guid, created_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [feed.id, i.guid, now()]);
    } else {
      const seen = new Set((await query('SELECT guid FROM rss_items WHERE feed_id=$1 AND guid = ANY($2)', [feed.id, items.map((i) => i.guid)])).map((r) => r.guid));
      const fresh = items.filter((i) => !seen.has(i.guid)).sort((a, b) => a.at - b.at).slice(-MAX_NEW_PER_CHECK);
      const valid = new Set((await query('SELECT id FROM social_accounts WHERE workspace_id=$1', [feed.workspace_id])).map((r) => r.id));
      const accounts: string[] = (feed.account_ids || []).filter((id: string) => valid.has(id));
      for (const item of fresh) {
        // Claim the item first, so overlapping runs never create two posts for it.
        const claimed = await query('INSERT INTO rss_items (feed_id, guid, created_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING guid', [feed.id, item.guid, now()]);
        if (!claimed.length) continue;
        const queue = feed.mode === 'queue' && accounts.length > 0;
        const at = queue ? (await nextOpenSlot(feed.workspace_id)) ?? now() + 30 * 60_000 : null;
        const post = await savePost(
          feed.workspace_id,
          {
            caption: renderTemplate(feed.template, item),
            targets: accounts.map((account_id) => ({ account_id })),
            status: queue ? 'scheduled' : 'draft',
            scheduled_at: at,
            labels: ['RSS'],
            note: `From ${title || feed.url}`,
          },
          null,
        );
        await exec('UPDATE rss_items SET post_id=$1 WHERE feed_id=$2 AND guid=$3', [post.id, feed.id, item.guid]);
        created++;
      }
    }
    await exec('UPDATE rss_feeds SET last_checked_at=$1, last_error=NULL, title=COALESCE($2, title) WHERE id=$3', [now(), title, feed.id]);
  } catch (e: any) {
    await exec('UPDATE rss_feeds SET last_checked_at=$1, last_error=$2 WHERE id=$3', [now(), String(e?.message || e).slice(0, 300), feed.id]);
  }
  return created;
}

/** Cron: checks feeds that are due, claiming each so overlapping runs don't double-check. */
export async function pollFeeds(limit = 20) {
  const due = await query(
    `SELECT id, last_checked_at FROM rss_feeds WHERE active AND (last_checked_at IS NULL OR last_checked_at < $1)
     ORDER BY last_checked_at NULLS FIRST LIMIT $2`,
    [now() - INTERVAL, limit],
  );
  let created = 0;
  for (const d of due) {
    const feed = (await query('UPDATE rss_feeds SET last_checked_at=$3 WHERE id=$1 AND last_checked_at IS NOT DISTINCT FROM $2::bigint RETURNING *', [d.id, d.last_checked_at, now()]))[0];
    if (!feed) continue;
    created += await checkFeed(feed, d.last_checked_at == null);
  }
  return created;
}

export const feedRow = (f: any) => ({
  id: f.id, url: f.url, title: f.title, mode: f.mode, template: f.template, account_ids: f.account_ids, active: f.active,
  last_checked_at: f.last_checked_at, last_error: f.last_error,
});

export async function getFeed(workspaceId: string, id: string) {
  return one('SELECT * FROM rss_feeds WHERE id=$1 AND workspace_id=$2', [id, workspaceId]);
}
