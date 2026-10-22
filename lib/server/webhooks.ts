import 'server-only';
import crypto from 'node:crypto';
import { exec, now, one, query } from './db';
import { safeFetch } from './safe-url';

/**
 * Outgoing webhooks (Zapier, Make, n8n, your own server). Each delivery is a JSON POST with
 *   X-SFY-Event: post.published | post.partial | post.failed | ping
 *   X-SFY-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<body>" with the webhook secret>
 * One attempt per event (5s timeout); the last result is shown in Automations.
 */
export const WEBHOOK_EVENTS = ['post.published', 'post.partial', 'post.failed'] as const;

export function sign(secret: string, body: string, t = Math.floor(now() / 1000)) {
  return `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
}

async function deliver(hook: any, event: string, data: unknown) {
  const body = JSON.stringify({ event, workspace_id: hook.workspace_id, sent_at: new Date(now()).toISOString(), data });
  let status: number | null = null;
  let error: string | null = null;
  try {
    const res = await safeFetch(hook.url, {
      method: 'POST',
      timeoutMs: 5000,
      maxBytes: 100_000,
      headers: { 'content-type': 'application/json', 'user-agent': 'ScheduleForYou-Webhooks/1', 'x-sfy-event': event, 'x-sfy-signature': sign(hook.secret, body) },
      body,
    });
    status = res.status;
    if (!res.ok) error = `HTTP ${res.status}`;
  } catch (e: any) {
    error = String(e?.message || e).slice(0, 300);
  }
  await exec('UPDATE webhooks SET last_status=$1, last_error=$2, last_sent_at=$3 WHERE id=$4', [status, error, now(), hook.id]);
  return { status, error };
}

/** Post data sent with post.* events. */
async function postData(postId: string) {
  const post = await one('SELECT id, caption, scheduled_at, status, labels, created_at FROM posts WHERE id=$1', [postId]);
  const targets = await query(
    `SELECT a.platform, a.username, t.status, t.external_url AS url, t.error, t.published_at FROM post_targets t
     LEFT JOIN social_accounts a ON a.id=t.account_id WHERE t.post_id=$1`,
    [postId],
  );
  const iso = (v: any) => (v ? new Date(Number(v)).toISOString() : null);
  return {
    post: { ...post, scheduled_at: iso(post?.scheduled_at), created_at: iso(post?.created_at) },
    targets: targets.map((t) => ({ ...t, published_at: iso(t.published_at) })),
  };
}

/** Fires a post event at every active webhook of the workspace that listens to it. Never throws. */
export async function firePostEvent(workspaceId: string, postId: string, event: string) {
  try {
    const hooks = await query(`SELECT * FROM webhooks WHERE workspace_id=$1 AND active AND events ? $2`, [workspaceId, event]);
    if (!hooks.length) return;
    const data = await postData(postId);
    await Promise.all(hooks.map((h) => deliver(h, event, data)));
  } catch (e: any) {
    console.error('[webhooks]', event, e?.message || e);
  }
}

export async function sendTestEvent(hook: any) {
  return deliver(hook, 'ping', { message: 'Test delivery from Schedule For You' });
}
