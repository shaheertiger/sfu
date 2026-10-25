import 'server-only';
import { exec, now, one, query } from './db';
import { esc, layout, sendEmail } from './email';
import { PLATFORMS, type PlatformId } from './platforms';
import { appUrl } from './url';

/**
 * The emails the Settings screen promises:
 * - failure alert right away (prefs.alerts.fail)
 * - reminder before each scheduled post (prefs.remind.on / lead, per-post `remind`)
 * - daily digest at 6 PM workspace time (prefs.alerts.digest)
 * plus team invites. Email problems are logged and never break publishing.
 */

const platformLabel = (p: string) => PLATFORMS[p as PlatformId]?.label || p;
/** "Bluesky (@maya)", or "a removed account" when the account no longer exists. */
const accountLabel = (platform?: string | null, username?: string | null) =>
  platform ? `${platformLabel(platform)} (@${username || '?'})` : 'a removed account';
const snippet = (s: string, n = 140) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s) || '(no caption)';
const prefOn = (v: unknown) => v !== false;

function when(at: number, tz: string) {
  try {
    return new Date(at).toLocaleString('en-US', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return new Date(at).toUTCString();
  }
}

async function ownerEmails(workspaceId: string): Promise<string[]> {
  const rows = await query(`SELECT u.email FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=$1 AND m.role='owner'`, [workspaceId]);
  return rows.map((r) => r.email);
}
async function userEmail(userId: string | null) {
  if (!userId) return null;
  return (await one('SELECT email FROM users WHERE id=$1', [userId]))?.email ?? null;
}

/* ---------- failure alert ---------- */
export type Failure = { platform: string; username: string; error: string };

export async function notifyFailures(post: any, failures: Failure[]) {
  if (!failures.length) return;
  try {
    const ws = await one('SELECT name, prefs FROM workspaces WHERE id=$1', [post.workspace_id]);
    if (!ws || !prefOn(ws.prefs?.alerts?.fail)) return;
    const to = [...(await ownerEmails(post.workspace_id)), await userEmail(post.created_by)].filter(Boolean) as string[];
    const list = failures.map((f) => `${accountLabel(f.platform, f.username)}: ${f.error}`);
    const subject = failures.length === 1 ? `A post to ${failures[0].platform ? platformLabel(failures[0].platform) : 'a removed account'} failed` : `A post failed on ${failures.length} accounts`;
    const url = `${appUrl()}/app`;
    await sendEmail({
      to,
      subject,
      text: `"${snippet(post.caption)}" could not be published in ${ws.name}.\n\n${list.join('\n')}\n\nOpen the dashboard to retry: ${url}`,
      html: layout(subject,
        `<p style="margin:0 0 12px">“${esc(snippet(post.caption))}” could not be published in <b>${esc(ws.name)}</b>.</p>
<ul style="margin:0;padding-left:18px">${list.map((l) => `<li style="margin:4px 0">${esc(l)}</li>`).join('')}</ul>`,
        { label: 'Open dashboard to retry', url }),
    });
  } catch (e: any) {
    console.error('[email] failure alert:', e?.message || e);
  }
}

/* ---------- reminders ---------- */
const MIN_NOTICE = 5 * 60_000; // no reminder for posts going out in under 5 minutes

/** Sends due reminders. Each post is claimed with UPDATE … RETURNING, so overlapping cron runs send once. */
export async function sendReminders(limit = 50) {
  const due = await query(
    `SELECT p.id, p.scheduled_at FROM posts p JOIN workspaces w ON w.id=p.workspace_id
     WHERE p.status='scheduled' AND p.remind AND p.scheduled_at IS NOT NULL
       AND p.reminded_for IS DISTINCT FROM p.scheduled_at
       AND COALESCE((w.prefs->'remind'->>'on')::boolean, true)
       AND COALESCE((w.prefs->>'paused')::boolean, false) = false
       AND COALESCE((w.prefs->'remind'->>'lead')::int, 60) > 0
       AND p.scheduled_at > $1::bigint + ${MIN_NOTICE}
       AND p.scheduled_at - COALESCE((w.prefs->'remind'->>'lead')::int, 60) * 60000 <= $1::bigint
       AND NOT EXISTS (SELECT 1 FROM post_targets t WHERE t.post_id=p.id AND t.attempts > 0)
     ORDER BY p.scheduled_at LIMIT $2`,
    [now(), limit],
  );
  let sent = 0;
  for (const d of due) {
    const claimed = await query('UPDATE posts SET reminded_for=scheduled_at WHERE id=$1 AND scheduled_at=$2 AND reminded_for IS DISTINCT FROM scheduled_at RETURNING *', [d.id, d.scheduled_at]);
    const post = claimed[0];
    if (!post) continue;
    try {
      const ws = await one('SELECT name, prefs FROM workspaces WHERE id=$1', [post.workspace_id]);
      const tz = ws?.prefs?.tz || 'UTC';
      const to = (await userEmail(post.created_by)) || (await ownerEmails(post.workspace_id));
      const accounts = await query(`SELECT a.platform, a.username FROM post_targets t JOIN social_accounts a ON a.id=t.account_id WHERE t.post_id=$1`, [post.id]);
      const where = accounts.map((a) => accountLabel(a.platform, a.username)).join(', ') || 'no accounts selected';
      const at = when(post.scheduled_at, tz);
      const pending = post.approval === 'pending' ? ' It is still waiting for approval and will not go out until someone approves it.' : '';
      const url = `${appUrl()}/app`;
      await sendEmail({
        to,
        subject: `Reminder: post goes out ${at}`,
        text: `"${snippet(post.caption)}" is scheduled for ${at} on ${where} in ${ws?.name}.${pending}\n\nReview or change it: ${url}`,
        html: layout('Your post goes out soon',
          `<p style="margin:0 0 12px">“${esc(snippet(post.caption))}”</p>
<p style="margin:0">Scheduled for <b>${esc(at)}</b> on ${esc(where)} in ${esc(ws?.name)}.${esc(pending)}</p>`,
          { label: 'Review post', url }),
      });
      sent++;
    } catch (e: any) {
      console.error('[email] reminder:', post.id, e?.message || e);
    }
  }
  return sent;
}

/* ---------- daily digest ---------- */
const DIGEST_HOUR = 18;

function localParts(tz: string, at: number) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' }).formatToParts(new Date(at));
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return { date: `${g('year')}-${g('month')}-${g('day')}`, hour: Number(g('hour')) };
}

/** One summary per workspace per day, the first time after 6 PM local time that there is something to report. Covers everything since the last digest. */
export async function sendDigests(limit = 50) {
  const t = now();
  const candidates = await query(
    // Only workspaces with something to report since their last digest (at most 24h back).
    `SELECT w.id, w.name, w.prefs, w.digest_sent_at, w.digest_sent_on FROM workspaces w
     WHERE COALESCE((w.prefs->'alerts'->>'digest')::boolean, true)
       AND (w.digest_sent_at IS NULL OR w.digest_sent_at < $1::bigint - 43200000)
       AND EXISTS (SELECT 1 FROM post_targets t JOIN posts p ON p.id=t.post_id
                   WHERE p.workspace_id=w.id
                     AND (t.published_at > GREATEST(COALESCE(w.digest_sent_at, 0), $1::bigint - 86400000)
                       OR t.failed_at > GREATEST(COALESCE(w.digest_sent_at, 0), $1::bigint - 86400000)))
     ORDER BY w.digest_sent_at NULLS FIRST LIMIT $2`,
    [t, limit * 4],
  );
  let sent = 0;
  for (const ws of candidates) {
    if (sent >= limit) break;
    let local;
    try {
      local = localParts(ws.prefs?.tz || 'UTC', t);
    } catch {
      local = localParts('UTC', t);
    }
    if (local.hour < DIGEST_HOUR || ws.digest_sent_on === local.date) continue;
    const since = Math.max(ws.digest_sent_at || 0, t - 24 * 3600_000);
    const claimed = await query(
      'UPDATE workspaces SET digest_sent_at=$1, digest_sent_on=$2 WHERE id=$3 AND digest_sent_on IS NOT DISTINCT FROM $4::text RETURNING id',
      [t, local.date, ws.id, ws.digest_sent_on ?? null],
    );
    if (!claimed.length) continue;
    try {
      const rows = await query(
        `SELECT p.caption, a.platform, a.username, t.status, t.external_url, t.error FROM post_targets t
         JOIN posts p ON p.id=t.post_id LEFT JOIN social_accounts a ON a.id=t.account_id
         WHERE p.workspace_id=$1 AND ((t.status='published' AND t.published_at > $2) OR (t.status='failed' AND t.failed_at > $2))
         ORDER BY COALESCE(t.published_at, t.failed_at)`,
        [ws.id, since],
      );
      if (!rows.length) continue; // nothing happened: no empty emails
      const upcoming = await one(`SELECT count(*)::int AS n FROM posts WHERE workspace_id=$1 AND status='scheduled' AND scheduled_at BETWEEN $2 AND $3`, [ws.id, t, t + 24 * 3600_000]);
      const published = rows.filter((r) => r.status === 'published');
      const failed = rows.filter((r) => r.status === 'failed');
      const line = (r: any) => `${accountLabel(r.platform, r.username)}: ${snippet(r.caption, 80)}`;
      const subject = `${ws.name}: ${published.length} published${failed.length ? `, ${failed.length} failed` : ''} today`;
      const url = `${appUrl()}/app`;
      const next = `${upcoming?.n || 0} post${upcoming?.n === 1 ? '' : 's'} scheduled for the next 24 hours.`;
      await sendEmail({
        to: await ownerEmails(ws.id),
        subject,
        text: [
          published.length ? `Published:\n${published.map((r) => `- ${line(r)}${r.external_url ? ` ${r.external_url}` : ''}`).join('\n')}` : '',
          failed.length ? `Failed:\n${failed.map((r) => `- ${line(r)}: ${r.error || ''}`).join('\n')}` : '',
          next,
          url,
        ].filter(Boolean).join('\n\n'),
        html: layout(`Today in ${ws.name}`,
          (published.length
            ? `<p style="margin:0 0 6px"><b>Published (${published.length})</b></p><ul style="margin:0 0 14px;padding-left:18px">${published
                .map((r) => `<li style="margin:4px 0">${r.external_url ? `<a href="${esc(r.external_url)}" style="color:#15171a">${esc(line(r))}</a>` : esc(line(r))}</li>`)
                .join('')}</ul>`
            : '') +
            (failed.length
              ? `<p style="margin:0 0 6px;color:#a1281f"><b>Failed (${failed.length})</b></p><ul style="margin:0 0 14px;padding-left:18px">${failed
                  .map((r) => `<li style="margin:4px 0">${esc(line(r))}: ${esc(r.error || '')}</li>`)
                  .join('')}</ul>`
              : '') +
            `<p style="margin:0">${esc(next)}</p>`,
          { label: 'Open dashboard', url }),
      });
      sent++;
    } catch (e: any) {
      console.error('[email] digest:', ws.id, e?.message || e);
    }
  }
  return sent;
}

/* ---------- reconnect alerts ---------- */
/** How far ahead an expiring sign-in is announced, and how often one account is mailed about. */
export const RECONNECT_AHEAD_MS = 3 * 86400_000;
const RECONNECT_REPEAT_MS = 7 * 86400_000;

/**
 * Tells the owners when an account needs reconnecting before a post fails over it: the platform
 * rejected its sign-in, or its token expires within 3 days and doesn't renew by itself. One email
 * per account per week, claimed with UPDATE … RETURNING so overlapping runs send once.
 */
export async function sendReconnectAlerts(limit = 50) {
  const t = now();
  const due = await query(
    `SELECT a.id FROM social_accounts a
     WHERE (a.status = 'error'
         OR (a.token_expires_at IS NOT NULL AND a.token_expires_at < $1 AND a.refresh_token IS NULL
             AND a.platform NOT IN ('threads','facebook','bluesky')
             AND NOT (a.platform = 'instagram' AND a.meta->>'token_kind' = 'page')))
       AND COALESCE((a.meta->>'reconnect_mailed_at')::bigint, 0) < $2
     ORDER BY a.token_expires_at NULLS FIRST LIMIT $3`,
    [t + RECONNECT_AHEAD_MS, t - RECONNECT_REPEAT_MS, limit],
  );
  let sent = 0;
  for (const d of due) {
    const [acc] = await query(
      `UPDATE social_accounts SET meta = meta || jsonb_build_object('reconnect_mailed_at', $2::bigint)
       WHERE id=$1 AND COALESCE((meta->>'reconnect_mailed_at')::bigint, 0) < $3 RETURNING *`,
      [d.id, t, t - RECONNECT_REPEAT_MS],
    );
    if (!acc) continue;
    try {
      const ws = await one('SELECT name, prefs FROM workspaces WHERE id=$1', [acc.workspace_id]);
      const tz = ws?.prefs?.tz || 'UTC';
      const upcoming = await query(
        `SELECT p.scheduled_at FROM posts p JOIN post_targets t ON t.post_id = p.id
         WHERE t.account_id=$1 AND p.status='scheduled' AND p.scheduled_at > $2 ORDER BY p.scheduled_at LIMIT 50`,
        [acc.id, t],
      );
      const who = accountLabel(acc.platform, acc.username);
      const broken = acc.status === 'error';
      const reason = broken ? (acc.last_error ? `${platformLabel(acc.platform)} no longer accepts its sign-in (${acc.last_error}).` : `${platformLabel(acc.platform)} no longer accepts its sign-in.`) : `Its sign-in expires ${when(Number(acc.token_expires_at), tz)}.`;
      const stakes = upcoming.length
        ? `${upcoming.length} scheduled post${upcoming.length === 1 ? '' : 's'} go${upcoming.length === 1 ? 'es' : ''} to this account, the first on ${when(Number(upcoming[0].scheduled_at), tz)}. ${upcoming.length === 1 ? 'It' : 'They'} will fail unless the account is reconnected first.`
        : 'Nothing is scheduled for it right now, but new posts to it will fail until it is reconnected.';
      const subject = broken ? `Reconnect ${who}: posts to it will fail` : `Reconnect ${who} before ${when(Number(acc.token_expires_at), tz)}`;
      const url = `${appUrl()}/app?screen=accounts`;
      await sendEmail({
        to: await ownerEmails(acc.workspace_id),
        subject,
        text: `${who} in ${ws?.name || 'your workspace'} needs reconnecting. ${reason}\n\n${stakes}\n\nReconnect it: ${url}`,
        html: layout(`${who} needs reconnecting`,
          `<p style="margin:0 0 12px">${esc(reason)}</p><p style="margin:0">${esc(stakes)}</p>`,
          { label: 'Reconnect account', url }),
      });
      sent++;
    } catch (e: any) {
      console.error('[email] reconnect alert:', acc.id, e?.message || e);
    }
  }
  return sent;
}

/* ---------- team invites ---------- */
export async function sendInviteEmail(opts: { to: string; inviter: { name: string; email: string }; workspaceName: string; url: string }) {
  const who = opts.inviter.name || opts.inviter.email;
  const subject = `${who} invited you to ${opts.workspaceName} on Schedule For You`;
  return sendEmail({
    to: opts.to,
    replyTo: opts.inviter.email,
    subject,
    text: `${who} invited you to join ${opts.workspaceName} on Schedule For You.\n\nAccept the invite: ${opts.url}`,
    html: layout(`Join ${opts.workspaceName}`,
      `<p style="margin:0">${esc(who)} invited you to join <b>${esc(opts.workspaceName)}</b> on Schedule For You. Sign up or sign in as ${esc(opts.to)} to accept.</p>`,
      { label: 'Accept invite', url: opts.url }),
  });
}
