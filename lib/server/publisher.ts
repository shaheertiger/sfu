import 'server-only';
import { exec, now, one, query, uid } from './db';
import { encrypt } from './crypto';
import { adapterFor } from './adapters';
import { OUT_OF_TIME_CODE, PublishError, isAuthError, timeLeft, userFacingError, withDeadline, type PublishInput, type SocialAccount } from './adapters/types';
import { mediaFiles, rowToAccount } from './posts';
import { notifyFailures, type Failure } from './notify';
import { canPublishSql } from './billing';
import { firePostEvent } from './webhooks';
import { withSignature } from './signature';
import { overLimitAccountIds } from './accounts';
import { PLATFORMS, type PlatformId } from './platforms';
import { nextOccurrence, safeTz, zonedTime } from './tz';
import { firstComment } from './thread';
import { shortenLinks } from './links';

export const MAX_ATTEMPTS = 3;
/** How many times a target may wait for the platform to finish processing media (about 2 minutes apart). */
export const MAX_PROCESSING_WAITS = 15;
/** A target isn't started with less time than this left in the run; it waits for the next run instead. */
export const MIN_TARGET_MS = 45_000;
/** How long a "publish now" request may spend publishing (its function may run 300 s). */
export const REQUEST_PUBLISH_MS = 240_000;
/** Threads tokens (60 days) are renewed when they have less than this left. */
export const THREADS_REFRESH_WINDOW_MS = 7 * 864e5;
const RETRY_DELAY_MS = 2 * 60_000;
const DRY_RUN = process.env.SFY_DRY_RUN === '1';

/* ---------- tokens ---------- */

type TokenFields = Pick<SocialAccount, 'platform' | 'refresh_token' | 'token_expires_at' | 'meta'>;

/** Whether an account's token should be renewed before it is used. */
export function needsRefresh(a: TokenFields, at = now()): boolean {
  if (!adapterFor(a.platform).refresh) return false;
  // Instagram accounts connected before Page tokens were used still hold an expiring user token.
  if (a.platform === 'instagram') return !!a.meta?.page_id && a.meta?.token_kind !== 'page';
  if (!a.token_expires_at) return false;
  // Threads has no refresh token: the token renews itself, and only while it is still valid.
  if (a.platform === 'threads') return a.token_expires_at < at + THREADS_REFRESH_WINDOW_MS;
  return !!a.refresh_token && a.token_expires_at < at + 5 * 60_000;
}

async function refreshAccount(account: SocialAccount): Promise<SocialAccount> {
  const upd = await adapterFor(account.platform).refresh!(account);
  if (!upd.access_token) throw new PublishError('The platform did not return a new sign-in token. Reconnect the account.', false, { auth: true });
  await exec(
    `UPDATE social_accounts SET access_token=$1, refresh_token=COALESCE($2, refresh_token), token_expires_at=$3, meta = meta || $4::jsonb, status='active', last_error=NULL WHERE id=$5`,
    [encrypt(upd.access_token), encrypt(upd.refresh_token ?? null), upd.token_expires_at ?? null, JSON.stringify(upd.meta || {}), account.id],
  );
  return {
    ...account,
    access_token: upd.access_token,
    refresh_token: upd.refresh_token ?? account.refresh_token,
    token_expires_at: upd.token_expires_at ?? null,
    meta: { ...account.meta, ...(upd.meta || {}) },
  };
}

async function freshAccount(row: any) {
  const account = rowToAccount(row);
  if (!needsRefresh(account)) return account;
  try {
    return await refreshAccount(account);
  } catch (e) {
    // A token that still works is used as it is; renewing is tried again later.
    const stillValid = account.platform === 'instagram' ? !isAuthError(e) : !!account.token_expires_at && account.token_expires_at > now() + 60_000;
    if (!stillValid) throw e;
    console.error(`[tokens] refresh failed for ${account.id}, using the current token:`, (e as any)?.message || e);
    return account;
  }
}

/**
 * Renews tokens that would otherwise lapse while no post goes out: Threads tokens near the end of
 * their 60 days, and Instagram user tokens swapped for Page tokens. A failure waits an hour before
 * the next try; a sign-in the platform no longer accepts marks the account for reconnecting.
 */
export async function refreshExpiringTokens({ limit = 20, deadline }: { limit?: number; deadline?: number } = {}): Promise<number> {
  // Platform calls inside give up by the deadline.
  if (deadline && timeLeft() === Infinity) return withDeadline(deadline, () => refreshExpiringTokens({ limit, deadline }));
  const t = now();
  const rows = await query(
    `SELECT * FROM social_accounts
     WHERE status='active'
       AND ((platform='threads' AND token_expires_at IS NOT NULL AND token_expires_at > $1 AND token_expires_at < $2)
         OR (platform='instagram' AND meta ? 'page_id' AND COALESCE(meta->>'token_kind', '') <> 'page'))
       AND COALESCE((meta->>'refresh_tried_at')::bigint, 0) < $3
     ORDER BY token_expires_at NULLS LAST LIMIT $4`,
    [t, t + THREADS_REFRESH_WINDOW_MS, t - 3600_000, limit],
  );
  let renewed = 0;
  for (const row of rows) {
    if (timeLeft() < 10_000) break;
    try {
      await refreshAccount(rowToAccount(row));
      renewed++;
    } catch (e) {
      console.error(`[tokens] refresh failed for ${row.id}:`, (e as any)?.message || e);
      if (isAuthError(e)) {
        await exec(`UPDATE social_accounts SET status='error', last_error=$1, meta = meta || jsonb_build_object('refresh_tried_at', $2::bigint) WHERE id=$3`, [userFacingError(e), now(), row.id]);
      } else {
        await exec(`UPDATE social_accounts SET meta = meta || jsonb_build_object('refresh_tried_at', $1::bigint) WHERE id=$2`, [now(), row.id]);
      }
    }
  }
  return renewed;
}

/* ---------- publishing ---------- */

const label = (platform: string) => PLATFORMS[platform as PlatformId]?.label || platform || 'The platform';

/**
 * Publishes every pending target of a post the caller has already claimed (status 'publishing').
 * With a deadline, a target is only started while there is time left for it; the others stay
 * pending and the post goes straight back to the queue for the next run.
 */
export async function publishPost(postId: string, { deadline }: { deadline?: number } = {}) {
  return withDeadline(deadline, () => publishClaimed(postId));
}

async function publishClaimed(postId: string) {
  const post = await one('SELECT * FROM posts WHERE id=$1', [postId]);
  if (!post) return null;
  const targets = await query('SELECT * FROM post_targets WHERE post_id=$1', [postId]);
  const media = await mediaFiles(post.workspace_id, post.media || []);
  const signature = post.signature === false ? '' : ((await one('SELECT signature FROM workspaces WHERE id=$1', [post.workspace_id]))?.signature || '').trim();
  const prefs = (await one('SELECT name, prefs FROM workspaces WHERE id=$1', [post.workspace_id]))?.prefs || {};
  const trackLinks = prefs.trackLinks === true;

  // Accounts past the plan's limit (e.g. after a downgrade) don't publish.
  const overLimit = await overLimitAccountIds(post.workspace_id);
  const failures: Failure[] = [];
  let outOfTime = false;
  const setProgress = (id: string, patch: Record<string, any>) =>
    exec('UPDATE post_targets SET progress = COALESCE(progress, \'{}\'::jsonb) || $1::jsonb WHERE id=$2', [JSON.stringify(patch), id]);
  const giveUp = async (target: any, msg: string, acc?: { platform?: string | null; username?: string | null } | null) => {
    await exec(`UPDATE post_targets SET status='failed', error=$1, failed_at=$2 WHERE id=$3`, [msg, now(), target.id]);
    acc ??= await one('SELECT platform, username FROM social_accounts WHERE id=$1', [target.account_id]).catch(() => null);
    failures.push({ platform: acc?.platform || '', username: acc?.username || '', error: msg });
  };

  for (const target of targets) {
    if (target.status !== 'pending' && target.status !== 'publishing') continue;
    const progress: Record<string, any> = target.progress || {};
    if (progress.sending) {
      // An earlier attempt sent the post and never heard back (the run was cut off): it may be live.
      const acc = await one('SELECT platform, username FROM social_accounts WHERE id=$1', [target.account_id]).catch(() => null);
      await giveUp(target, `Publishing was interrupted after the post was sent to ${label(acc?.platform)}, so it may already be live. Check @${acc?.username || 'the account'} and retry only if it isn't there.`, acc);
      continue;
    }
    if (target.attempts >= MAX_ATTEMPTS) {
      await giveUp(target, target.error ? `Gave up after ${MAX_ATTEMPTS} attempts: ${target.error}` : `Publishing was interrupted ${MAX_ATTEMPTS} times. Retry the post to try again.`);
      continue;
    }
    if (timeLeft() < MIN_TARGET_MS) {
      outOfTime = true;
      break;
    }
    await exec(`UPDATE post_targets SET status='publishing', attempts=attempts+1 WHERE id=$1`, [target.id]);
    const attempts = target.attempts + 1;
    let sent = false;
    let account: SocialAccount | null = null;
    const state: Record<string, any> = { ...progress };
    try {
      const accRow = await one('SELECT * FROM social_accounts WHERE id=$1 AND workspace_id=$2', [target.account_id, post.workspace_id]);
      if (!accRow) throw new PublishError('Account was disconnected', false);
      if (overLimit.has(accRow.id)) {
        throw new PublishError("This account is paused because the workspace is over its plan's account limit. Upgrade or disconnect an account, then retry.", false);
      }
      account = await freshAccount(accRow);
      const linkCtx = { workspaceId: post.workspace_id, postId: post.id, targetId: target.id };
      let caption = withSignature(target.caption_override ?? post.caption, signature, account.platform);
      if (trackLinks) caption = await shortenLinks(caption, linkCtx);
      const input: PublishInput = {
        account,
        caption,
        media,
        options: target.options || {},
        progress: { ...progress },
        save: async (patch) => {
          Object.assign(state, patch);
          await setProgress(target.id, patch);
        },
        sending: async () => {
          sent = true;
          await setProgress(target.id, { sending: now() });
        },
      };
      const result = DRY_RUN
        ? { externalId: 'dry_' + uid(), url: `https://example.com/${account.platform}/${account.username}/dry-run` }
        : await adapterFor(account.platform).publish(input);
      await exec(`UPDATE post_targets SET status='published', external_id=$1, external_url=$2, error=NULL, published_at=$3, progress='{}'::jsonb WHERE id=$4`,
        [result.externalId, result.url ?? null, now(), target.id]);
      // The first comment goes on after the post is recorded as published: the post is live either way,
      // so a comment that fails is noted on the target but never fails or resends the post.
      const comment = firstComment(target.options);
      if (comment && !DRY_RUN) await addFirstComment(target.id, account, result.externalId, trackLinks ? await shortenLinks(comment, linkCtx) : comment);
    } catch (e: any) {
      const pe = e instanceof PublishError ? e : null;
      let msg = userFacingError(e);
      console.error(`[publish] ${postId} → ${target.account_id} failed (attempt ${attempts}):`, pe ? msg : e);
      if (pe?.code === OUT_OF_TIME_CODE && !sent) {
        // Nothing was sent: hand the attempt back and leave the target to the next run.
        await exec(`UPDATE post_targets SET status='pending', attempts=GREATEST(attempts-1, 0) WHERE id=$1`, [target.id]);
        outOfTime = true;
        break;
      }
      if (pe?.processing && !sent) {
        // Not a failure: the platform is still processing the media. Check back without using up an attempt.
        const waits = Number(state.waits || 0) + 1;
        if (waits <= MAX_PROCESSING_WAITS) {
          await exec(`UPDATE post_targets SET status='pending', attempts=GREATEST(attempts-1, 0), error=$1, progress = COALESCE(progress, '{}'::jsonb) || $2::jsonb WHERE id=$3`,
            [msg, JSON.stringify({ waits }), target.id]);
          continue;
        }
        await giveUp(target, `${label(account?.platform || '')} took too long to process the media. Try a shorter or smaller file.`, account);
        continue;
      }
      // An error answer from the platform means it refused the post. No answer at all means it may have taken it.
      const answered = (pe && !pe.uncertain) || (!pe && typeof e?.status === 'number' && e.status >= 400 && e.status < 500);
      if (sent && !answered) {
        msg = `${label(account?.platform || '')} didn't confirm the post (${msg}), so it may already be live. Check @${account?.username || 'the account'} and retry only if it isn't there.`;
        await giveUp(target, msg, account);
      } else {
        const retryable = pe ? pe.retryable : true;
        const final = !retryable || attempts >= MAX_ATTEMPTS;
        await exec(`UPDATE post_targets SET status=$1, error=$2, failed_at=$3, progress = COALESCE(progress, '{}'::jsonb) - 'sending' WHERE id=$4`,
          [final ? 'failed' : 'pending', msg, final ? now() : null, target.id]);
        if (final) {
          const acc = account ?? (await one('SELECT platform, username FROM social_accounts WHERE id=$1', [target.account_id]).catch(() => null));
          failures.push({ platform: acc?.platform || '', username: acc?.username || '', error: msg });
        }
      }
      if (isAuthError(e)) await exec(`UPDATE social_accounts SET status='error', last_error=$1 WHERE id=$2`, [msg, target.account_id]);
    }
  }

  const rows = await query('SELECT status FROM post_targets WHERE post_id=$1', [postId]);
  const published = rows.filter((t) => t.status === 'published').length;
  const failed = rows.filter((t) => t.status === 'failed').length;
  const pending = rows.length - published - failed;
  // A post whose accounts were all disconnected meanwhile has nothing to publish: back to drafts.
  const status = !rows.length ? 'draft' : pending > 0 ? 'scheduled' : published === rows.length ? 'published' : published === 0 ? 'failed' : 'partial';
  // Retries wait a couple of minutes rather than hammering the platform; targets that ran out of time go in the next run.
  await exec('UPDATE posts SET status=$1, scheduled_at=CASE WHEN $1=\'scheduled\' THEN $2::bigint ELSE scheduled_at END, updated_at=$3 WHERE id=$4',
    [status, outOfTime ? now() : now() + RETRY_DELAY_MS, now(), postId]);
  if (status === 'published' || status === 'partial') await scheduleFollowUps(post);
  await notifyFailures(post, failures);
  if (status !== 'scheduled' && status !== 'draft') await firePostEvent(post.workspace_id, postId, `post.${status}`);
  return status;
}

/** Posts the first comment on a published target. Problems are recorded on the target, never thrown. */
async function addFirstComment(targetId: string, account: SocialAccount, externalId: string, text: string) {
  const adapter = adapterFor(account.platform);
  if (!adapter.comment) return;
  try {
    await adapter.comment({ account, externalId, text });
  } catch (e: any) {
    const pe = e instanceof PublishError ? e : null;
    const why = pe?.code === OUT_OF_TIME_CODE ? 'there was no time left in this publishing run' : userFacingError(e);
    console.error(`[publish] first comment on ${targetId} failed:`, pe ? why : e);
    await exec('UPDATE post_targets SET error=$1 WHERE id=$2', [`Published, but the first comment was not added: ${why}`, targetId]).catch(() => {});
  }
}

/**
 * When a repeating post's next copy goes out: the series' next occurrence after now, stepped from
 * the series anchor in the workspace's timezone (same weekday and local time across DST changes;
 * monthly keeps the anchor's day, clamped to short months without drifting). Missed occurrences
 * (e.g. while the queue was paused) are skipped, not caught up.
 */
export function nextRepeat(post: { repeat: string; scheduled_at: number | null; repeat_anchor?: number | null; repeat_n?: number | null }, tz: string, after = now()) {
  if (post.repeat !== 'weekly' && post.repeat !== 'monthly') return null;
  const anchor = post.repeat_anchor ?? post.scheduled_at;
  if (anchor == null) return null;
  const n = post.repeat_anchor != null ? Number(post.repeat_n || 0) : 0;
  const next = nextOccurrence(Number(anchor), n, post.repeat, tz, after);
  return next && { at: next.at, anchor: Number(anchor), n: next.n };
}

/** Repeating posts get their next occurrence; evergreen posts go back into the next open slot. */
async function scheduleFollowUps(post: any) {
  let at: number | null = null;
  let anchor: number | null = null;
  let n = 0;
  if (post.repeat === 'weekly' || post.repeat === 'monthly') {
    const ws = await one('SELECT prefs FROM workspaces WHERE id=$1', [post.workspace_id]);
    const next = nextRepeat(post, safeTz(ws?.prefs?.tz));
    if (next) ({ at, anchor, n } = next);
  } else if (post.evergreen) at = await nextOpenSlot(post.workspace_id);
  if (!at) return;
  const id = uid('post');
  // parent_id is unique, so a retried post never spawns a second copy.
  const made = await exec(`INSERT INTO posts (id, workspace_id, caption, media, scheduled_at, status, labels, repeat, evergreen, approval, remind, note, signature, created_by, parent_id, repeat_anchor, repeat_n, created_at, updated_at)
              SELECT $1, workspace_id, caption, media, $2, 'scheduled', labels, repeat, evergreen, CASE WHEN approval='approved' THEN 'approved' ELSE NULL END, remind, note, signature, created_by, id, $5, $6, $3, $3 FROM posts WHERE id=$4
              ON CONFLICT (parent_id) WHERE parent_id IS NOT NULL DO NOTHING`,
    [id, at, now(), post.id, anchor, n]);
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
  const tz = safeTz(prefs.tz);
  const from = now();
  for (let d = 0; d < 120; d++) {
    for (const sl of slots) {
      const at = zonedTime(tz, d, sl, from);
      if (at <= now() || taken.has(at)) continue;
      const dow = new Date(at).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short' });
      if (!days.includes(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dow))) continue;
      return at;
    }
  }
  return null;
}

/**
 * One scheduler pass (called by Vercel Cron every minute). Claims one due post at a time with
 * FOR UPDATE SKIP LOCKED, so overlapping runs never publish the same post twice and a run never
 * holds posts it has no time left to publish.
 */
export async function runDue({ deadline = now() + 200_000, batch = 1 }: { deadline?: number; batch?: number } = {}) {
  const started = now();
  // Posts stuck in 'publishing' (a crashed run) go back to the queue after 15 minutes.
  await exec(`UPDATE posts SET status='scheduled' WHERE status='publishing' AND updated_at < $1`, [now() - 15 * 60_000]);
  await exec(`UPDATE post_targets SET status='pending' WHERE status='publishing' AND post_id IN (SELECT id FROM posts WHERE status='scheduled')`);
  const results: Record<string, string | null> = {};
  while (deadline - now() > MIN_TARGET_MS + 5_000) {
    const claimed = await query(
      `UPDATE posts SET status='publishing', updated_at=$1
       WHERE id IN (
         SELECT p.id FROM posts p JOIN workspaces w ON w.id = p.workspace_id
         WHERE p.status='scheduled' AND p.scheduled_at IS NOT NULL AND p.scheduled_at <= $1
           AND p.approval IS DISTINCT FROM 'pending'
           AND COALESCE((w.prefs->>'paused')::boolean, false) = false
           AND ${canPublishSql()}
         ORDER BY p.scheduled_at LIMIT $2 FOR UPDATE OF p SKIP LOCKED)
       RETURNING id`,
      [now(), batch],
    );
    if (!claimed.length) break;
    for (const { id } of claimed) results[id] = await publishPost(id, { deadline });
  }
  return { processed: Object.keys(results).length, results, ms: now() - started };
}
