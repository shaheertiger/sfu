import 'server-only';
import { isPaid } from './billing';
import { randomToken } from './crypto';
import { exec, now, one, query } from './db';
import { PLATFORMS, type PlatformId } from './platforms';
import { readUrl, storageConfigured } from './storage';
import { safeTz } from './tz';
import { appUrl } from './url';
import { buildIcs, type IcsPost } from './ics';

/*
 * Shared calendar: a read-only page (/c/<token>) and an iCal feed (/c/<token>/feed.ics) of the
 * workspace's upcoming and recent posts, for clients and teammates without an account. The token
 * is the only credential; rotating it ends every copy of the link.
 */
export const TOKEN_RE = /^[\w-]{20,64}$/;
/** How far the calendar looks ahead and back. */
export const AHEAD_MS = 90 * 86400_000;
export const BACK_MS = 14 * 86400_000;

export const calendarUrls = (token: string, req?: Request) => {
  const base = appUrl(req);
  return { url: `${base}/c/${token}`, ics_url: `${base}/c/${token}/feed.ics` };
};

export async function calendarToken(workspaceId: string): Promise<string | null> {
  return (await one('SELECT calendar_token FROM workspaces WHERE id=$1', [workspaceId]))?.calendar_token ?? null;
}

/** Turns the link on (keeping the current token) or rotates it. */
export async function enableCalendarLink(workspaceId: string, rotate = false): Promise<string> {
  const current = await calendarToken(workspaceId);
  if (current && !rotate) return current;
  const token = randomToken(24);
  await exec('UPDATE workspaces SET calendar_token=$1 WHERE id=$2', [token, workspaceId]);
  return token;
}

export async function disableCalendarLink(workspaceId: string) {
  await exec('UPDATE workspaces SET calendar_token=NULL WHERE id=$1', [workspaceId]);
}

export type CalendarPost = IcsPost & {
  targets: { platform: string; label: string; username: string | null; status: string; url: string | null }[];
  media: { url: string; mime: string }[];
  labels: string[];
};

/** Everything the calendar page and feed show, or null for an unknown token. */
export async function loadCalendar(token: string): Promise<{ workspace: { id: string; name: string; tz: string }; posts: CalendarPost[] } | null> {
  if (!TOKEN_RE.test(token)) return null;
  const ws = await one('SELECT * FROM workspaces WHERE calendar_token=$1', [token]);
  // The shared calendar is a paid feature: on Free the link answers as if it were off.
  if (!ws || !isPaid(ws)) return null;
  const t = now();
  const posts = await query(
    `SELECT id, caption, scheduled_at, status, approval, labels, media FROM posts
     WHERE workspace_id=$1 AND scheduled_at IS NOT NULL AND scheduled_at BETWEEN $2 AND $3
       AND status IN ('scheduled','publishing','published','partial','failed')
     ORDER BY scheduled_at LIMIT 500`,
    [ws.id, t - BACK_MS, t + AHEAD_MS],
  );
  const ids = posts.map((p) => p.id);
  const targets = ids.length
    ? await query(
        `SELECT t.post_id, t.status, t.external_url, a.platform, a.username FROM post_targets t
         LEFT JOIN social_accounts a ON a.id=t.account_id WHERE t.post_id = ANY($1) ORDER BY a.platform, a.username`,
        [ids],
      )
    : [];
  const byPost = new Map<string, any[]>();
  for (const tg of targets) byPost.set(tg.post_id, [...(byPost.get(tg.post_id) || []), tg]);

  // Thumbnails: signed URLs for the images (videos show as a tile), skipped when storage is off.
  const mediaIds = [...new Set(posts.flatMap((p) => (Array.isArray(p.media) ? p.media : [])))].slice(0, 400);
  const mediaById = new Map<string, { url: string; mime: string }>();
  if (mediaIds.length && storageConfigured()) {
    const rows = await query('SELECT id, object_key, mime FROM media WHERE workspace_id=$1 AND id = ANY($2) AND uploaded', [ws.id, mediaIds]);
    await Promise.all(rows.map(async (m) => {
      try { mediaById.set(m.id, { url: await readUrl(m.object_key, 3600), mime: m.mime }); } catch { /* no thumbnail */ }
    }));
  }
  const label = (platform: string) => PLATFORMS[platform as PlatformId]?.label || platform || 'Removed account';
  return {
    workspace: { id: ws.id, name: ws.name, tz: safeTz(ws.prefs?.tz) },
    posts: posts.map((p) => {
      const tgs = byPost.get(p.id) || [];
      return {
        id: p.id,
        caption: p.caption,
        at: Number(p.scheduled_at),
        status: p.status === 'publishing' ? 'scheduled' : p.status,
        approval: p.approval,
        labels: Array.isArray(p.labels) ? p.labels : [],
        platforms: [...new Set(tgs.map((tg) => label(tg.platform)))],
        targets: tgs.map((tg) => ({ platform: tg.platform, label: label(tg.platform), username: tg.username, status: tg.status, url: tg.external_url })),
        media: (Array.isArray(p.media) ? p.media : []).map((id: string) => mediaById.get(id)).filter(Boolean) as { url: string; mime: string }[],
        url: tgs.find((tg) => tg.status === 'published' && tg.external_url)?.external_url || null,
      };
    }),
  };
}

export function calendarIcs(data: NonNullable<Awaited<ReturnType<typeof loadCalendar>>>): string {
  return buildIcs({ name: data.workspace.name, tz: data.workspace.tz, posts: data.posts, domain: new URL(appUrl()).host });
}
