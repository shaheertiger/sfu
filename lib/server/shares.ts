import 'server-only';
import { randomToken } from './crypto';
import { esc, layout, sendEmail } from './email';
import { exec, now, one, query, uid } from './db';
import { mediaFiles } from './posts';
import { PLATFORMS, type PlatformId } from './platforms';
import { appUrl } from './url';

/**
 * Client preview links: anyone with the link can see a post, approve it or ask for changes,
 * without an account. Links last 30 days; sharing the same post again reuses the live link.
 */
const TTL = 30 * 86400_000;
const MAX_COMMENTS = 100;

export async function createShare(workspaceId: string, postId: string, userId: string | null, req?: Request) {
  const live = await one('SELECT token, expires_at FROM post_shares WHERE post_id=$1 AND expires_at > $2 ORDER BY expires_at DESC LIMIT 1', [postId, now() + 7 * 86400_000]);
  const token = live?.token || randomToken(18);
  const expires = live?.expires_at || now() + TTL;
  if (!live) await exec('INSERT INTO post_shares (token, post_id, workspace_id, created_by, created_at, expires_at) VALUES ($1,$2,$3,$4,$5,$6)', [token, postId, workspaceId, userId, now(), expires]);
  return { url: `${appUrl(req)}/p/${token}`, token, expires_at: Number(expires) };
}

export async function loadShare(token: string) {
  if (!/^[\w-]{10,64}$/.test(token)) return null;
  const share = await one('SELECT * FROM post_shares WHERE token=$1', [token]);
  if (!share || Number(share.expires_at) < now()) return null;
  const post = await one('SELECT * FROM posts WHERE id=$1', [share.post_id]);
  if (!post) return null;
  const ws = await one('SELECT name, prefs FROM workspaces WHERE id=$1', [share.workspace_id]);
  const targets = await query(
    `SELECT a.platform, a.username, a.display_name, t.caption_override, t.status, t.external_url FROM post_targets t
     LEFT JOIN social_accounts a ON a.id=t.account_id WHERE t.post_id=$1`,
    [post.id],
  );
  const media = await mediaFiles(post.workspace_id, post.media || []).catch(() => []);
  const comments = await query('SELECT author, body, kind, source, created_at FROM post_comments WHERE post_id=$1 ORDER BY created_at', [post.id]);
  return {
    share,
    workspaceName: ws?.name || 'Workspace',
    tz: ws?.prefs?.tz || 'UTC',
    post: { id: post.id, caption: post.caption, status: post.status, approval: post.approval, scheduled_at: post.scheduled_at ? Number(post.scheduled_at) : null },
    targets: targets.map((t) => ({
      platform: t.platform,
      label: PLATFORMS[t.platform as PlatformId]?.label || t.platform || 'Removed account',
      username: t.username,
      caption: t.caption_override,
      status: t.status,
      url: t.external_url,
    })),
    media: media.map((m) => ({ url: m.url, mime: m.mime, filename: m.filename })),
    comments: comments.map((c) => ({ ...c, created_at: Number(c.created_at) })),
  };
}

export type ShareAction = 'comment' | 'approve' | 'changes';

/** A client's comment, approval or change request. */
export async function actOnShare(token: string, action: ShareAction, author: string, text: string) {
  const data = await loadShare(token);
  if (!data) return { error: 'This link has expired or does not exist.', status: 404 };
  const { post } = data;
  if (data.comments.length >= MAX_COMMENTS) return { error: 'This post has too many comments.', status: 429 };
  if (action !== 'comment' && post.status === 'published') return { error: 'This post is already published.', status: 409 };
  const body = text.trim() || (action === 'approve' ? 'Approved' : '');
  if (!body) return { error: 'Write a comment first.', status: 400 };
  await exec('INSERT INTO post_comments (id, post_id, author, body, kind, source, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [
    uid('cmt'), post.id, author, body, action === 'comment' ? 'comment' : action === 'approve' ? 'approved' : 'changes', 'client', now(),
  ]);
  if (action === 'approve') await exec(`UPDATE posts SET approval='approved', updated_at=$1 WHERE id=$2 AND approval='pending'`, [now(), post.id]);
  if (action === 'changes') await exec(`UPDATE posts SET approval='pending', updated_at=$1 WHERE id=$2 AND status IN ('draft','scheduled')`, [now(), post.id]);
  await notifyTeam(data, action, author, body).catch((e) => console.error('[share] email:', e?.message || e));
  return { ok: true };
}

async function notifyTeam(data: NonNullable<Awaited<ReturnType<typeof loadShare>>>, action: ShareAction, author: string, body: string) {
  const row = await one('SELECT workspace_id, created_by FROM posts WHERE id=$1', [data.post.id]);
  const to = (
    await query(
      `SELECT DISTINCT u.email FROM users u WHERE u.id = $2
       OR u.id IN (SELECT user_id FROM workspace_members WHERE workspace_id=$1 AND role='owner')`,
      [row.workspace_id, row.created_by],
    )
  ).map((r) => r.email);
  const what = action === 'approve' ? 'approved a post' : action === 'changes' ? 'asked for changes to a post' : 'commented on a post';
  const snippet = data.post.caption.length > 120 ? data.post.caption.slice(0, 119) + '…' : data.post.caption || '(no caption)';
  const url = `${appUrl()}/app`;
  await sendEmail({
    to,
    subject: `${author} ${what} in ${data.workspaceName}`,
    text: `${author} ${what}: "${snippet}"\n\n${body}\n\nOpen the dashboard: ${url}`,
    html: layout(`${author} ${what}`, `<p style="margin:0 0 12px;color:#677184">“${esc(snippet)}”</p><p style="margin:0;white-space:pre-wrap">${esc(body)}</p>`, { label: 'Open dashboard', url }),
  });
}
