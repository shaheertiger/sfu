import 'server-only';
import { exec, now, one, query, uid } from './db';
import { encrypt } from './crypto';
import { adapterFor } from './adapters';
import { PublishError } from './adapters/types';
import { mediaFiles, rowToAccount } from './posts';

const MAX_ATTEMPTS = 3;
const DRY_RUN = process.env.SFY_DRY_RUN === '1';

async function freshAccount(row: any) {
  const account = rowToAccount(row);
  const adapter = adapterFor(account.platform);
  if (adapter.refresh && account.refresh_token && account.token_expires_at && account.token_expires_at < now() + 5 * 60_000) {
    const upd = await adapter.refresh(account);
    await exec('UPDATE social_accounts SET access_token=$1, refresh_token=COALESCE($2, refresh_token), token_expires_at=$3, status=$4, last_error=NULL WHERE id=$5',
      [encrypt(upd.access_token!), encrypt(upd.refresh_token ?? null), upd.token_expires_at ?? null, 'active', account.id]);
    return { ...account, ...upd };
  }
  return account;
}

const isAuthError = (msg: string) => /\b(401|403)\b|invalid[_ ]token|expired|revoked|unauthori[sz]ed|permission/i.test(msg);

/** Publishes every pending target of a post the caller has already claimed (status 'publishing'). */
export async function publishPost(postId: string) {
  const post = await one('SELECT * FROM posts WHERE id=$1', [postId]);
  if (!post) return null;
  const targets = await query('SELECT * FROM post_targets WHERE post_id=$1', [postId]);
  const media = await mediaFiles(post.workspace_id, post.media || []);

  for (const target of targets) {
    if (target.status === 'published') continue;
    if (target.status === 'failed' && target.attempts >= MAX_ATTEMPTS) continue;
    await exec(`UPDATE post_targets SET status='publishing', attempts=attempts+1 WHERE id=$1`, [target.id]);
    const attempts = target.attempts + 1;
    try {
      const accRow = await one('SELECT * FROM social_accounts WHERE id=$1 AND workspace_id=$2', [target.account_id, post.workspace_id]);
      if (!accRow) throw new PublishError('Account was disconnected', false);
      const account = await freshAccount(accRow);
      const caption = target.caption_override ?? post.caption;
      const result = DRY_RUN
        ? { externalId: 'dry_' + uid(), url: `https://example.com/${account.platform}/${account.username}/dry-run` }
        : await adapterFor(account.platform).publish({ account, caption, media, options: target.options || {} });
      await exec(`UPDATE post_targets SET status='published', external_id=$1, external_url=$2, error=NULL, published_at=$3 WHERE id=$4`,
        [result.externalId, result.url ?? null, now(), target.id]);
    } catch (e: any) {
      const msg = String(e?.message || e).slice(0, 1000);
      const retryable = e instanceof PublishError ? e.retryable : true;
      const final = !retryable || attempts >= MAX_ATTEMPTS;
      await exec('UPDATE post_targets SET status=$1, error=$2 WHERE id=$3', [final ? 'failed' : 'pending', msg, target.id]);
      if (isAuthError(msg)) await exec(`UPDATE social_accounts SET status='error', last_error=$1 WHERE id=$2`, [msg, target.account_id]);
      console.error(`[publish] ${postId} → ${target.account_id} failed (attempt ${attempts}):`, msg);
    }
  }

  const rows = await query('SELECT status FROM post_targets WHERE post_id=$1', [postId]);
  const published = rows.filter((t) => t.status === 'published').length;
  const failed = rows.filter((t) => t.status === 'failed').length;
  const pending = rows.length - published - failed;
  const status = pending > 0 ? 'scheduled' : published === rows.length ? 'published' : published === 0 ? 'failed' : 'partial';
  // Retries wait a couple of minutes rather than hammering the platform.
  await exec('UPDATE posts SET status=$1, scheduled_at=CASE WHEN $1=\'scheduled\' THEN $2::bigint ELSE scheduled_at END, updated_at=$3 WHERE id=$4',
    [status, now() + 2 * 60_000, now(), postId]);
  if (status === 'published' || status === 'partial') await scheduleFollowUps(post);
  return status;
}

/** Repeating posts get their next occurrence; evergreen posts go back into the next open slot. */
async function scheduleFollowUps(post: any) {
  let at: number | null = null;
  if (post.repeat === 'weekly' || post.repeat === 'monthly') {
    // Next occurrence after now: missed occurrences (e.g. while the queue was paused) are skipped, not caught up.
    const d = new Date(post.scheduled_at);
    do {
      if (post.repeat === 'weekly') d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
    } while (d.getTime() <= now());
    at = d.getTime();
  } else if (post.evergreen) at = await nextOpenSlot(post.workspace_id);
  if (!at) return;
  const id = uid('post');
  // parent_id is unique, so a retried post never spawns a second copy.
  const made = await exec(`INSERT INTO posts (id, workspace_id, caption, media, scheduled_at, status, labels, repeat, evergreen, approval, remind, note, created_by, parent_id, created_at, updated_at)
              SELECT $1, workspace_id, caption, media, $2, 'scheduled', labels, repeat, evergreen, CASE WHEN approval='approved' THEN 'approved' ELSE NULL END, remind, note, created_by, id, $3, $3 FROM posts WHERE id=$4
              ON CONFLICT (parent_id) WHERE parent_id IS NOT NULL DO NOTHING`,
    [id, at, now(), post.id]);
  if (!made) return;
  await exec(`INSERT INTO post_targets (id, post_id, account_id, caption_override, options)
              SELECT 'tgt_' || substr(md5(random()::text), 1, 16), $1, account_id, caption_override, options FROM post_targets WHERE post_id=$2`, [id, post.id]);
}

/** First free posting slot (workspace prefs) from now, in the workspace's timezone. */
export async function nextOpenSlot(workspaceId: string): Promise<number | null> {
  const ws = await one('SELECT prefs FROM workspaces WHERE id=$1', [workspaceId]);
  const prefs = ws?.prefs || {};
  const slots: string[] = [...(prefs.slots || [])].sort();
  const days: number[] = prefs.slotDays || [];
  if (!slots.length || !days.length) return null;
  const taken = new Set((await query(`SELECT scheduled_at FROM posts WHERE workspace_id=$1 AND status='scheduled' AND scheduled_at > $2`, [workspaceId, now()])).map((r) => r.scheduled_at));
  const tz = prefs.tz || 'UTC';
  for (let d = 0; d < 120; d++) {
    for (const sl of slots) {
      const at = zonedTime(tz, d, sl);
      if (at <= now() || taken.has(at)) continue;
      const dow = new Date(at).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short' });
      if (!days.includes(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dow))) continue;
      return at;
    }
  }
  return null;
}

/** Epoch ms for "today + dayOffset at HH:MM" in an IANA timezone. */
function zonedTime(tz: string, dayOffset: number, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now() + dayOffset * 864e5));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const guess = Date.UTC(get('year'), get('month') - 1, get('day'), h, m);
  const off = tzOffset(tz, guess);
  return guess - off;
}
function tzOffset(tz: string, at: number) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(at));
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - Math.floor(at / 1000) * 1000;
}

/**
 * One scheduler pass (called by Vercel Cron every minute). Claims due posts with
 * FOR UPDATE SKIP LOCKED so overlapping runs never publish the same post twice.
 */
export async function runDue({ budgetMs = 240_000, batch = 10 } = {}) {
  const started = now();
  // Posts stuck in 'publishing' (a crashed run) go back to the queue after 15 minutes.
  await exec(`UPDATE posts SET status='scheduled' WHERE status='publishing' AND updated_at < $1`, [now() - 15 * 60_000]);
  await exec(`UPDATE post_targets SET status='pending' WHERE status='publishing' AND post_id IN (SELECT id FROM posts WHERE status='scheduled')`);
  const results: Record<string, string | null> = {};
  while (now() - started < budgetMs) {
    const claimed = await query(
      `UPDATE posts SET status='publishing', updated_at=$1
       WHERE id IN (
         SELECT p.id FROM posts p JOIN workspaces w ON w.id = p.workspace_id
         WHERE p.status='scheduled' AND p.scheduled_at IS NOT NULL AND p.scheduled_at <= $1
           AND p.approval IS DISTINCT FROM 'pending'
           AND COALESCE((w.prefs->>'paused')::boolean, false) = false
         ORDER BY p.scheduled_at LIMIT $2 FOR UPDATE OF p SKIP LOCKED)
       RETURNING id`,
      [now(), batch],
    );
    if (!claimed.length) break;
    for (const { id } of claimed) results[id] = await publishPost(id);
  }
  return { processed: Object.keys(results).length, results, ms: now() - started };
}
