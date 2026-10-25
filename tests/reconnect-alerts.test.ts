import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

test('owners are mailed once a week about accounts that need reconnecting, with the posts at stake', async () => {
  const t = Date.now();
  const accounts: any[] = [
    { id: 'broken', workspace_id: 'ws', platform: 'instagram', username: 'harbor.ig', status: 'error', last_error: 'Session expired', token_expires_at: null, refresh_token: null, meta: {} },
    { id: 'soon', workspace_id: 'ws', platform: 'linkedin', username: 'Harbor', status: 'active', last_error: null, token_expires_at: t + 86400_000, refresh_token: null, meta: {} },
    { id: 'mailed', workspace_id: 'ws', platform: 'x', username: 'old', status: 'error', last_error: 'x', token_expires_at: null, refresh_token: null, meta: { reconnect_mailed_at: t - 3600_000 } },
  ];
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (sql.startsWith('SELECT a.id FROM social_accounts')) {
      // Mirrors the SQL: broken, or expiring within the window without self-renewal; not mailed in the last week.
      return { rows: accounts.filter((a) => (a.status === 'error' || (a.token_expires_at && a.token_expires_at < p[0] && !a.refresh_token)) && (a.meta.reconnect_mailed_at || 0) < p[1]).map((a) => ({ id: a.id })), rowCount: 0 };
    }
    if (sql.startsWith('UPDATE social_accounts SET meta = meta || jsonb_build_object(\'reconnect_mailed_at\'')) {
      const a = accounts.find((x) => x.id === p[0]);
      if (!a || (a.meta.reconnect_mailed_at || 0) >= p[2]) return { rows: [], rowCount: 0 };
      a.meta = { ...a.meta, reconnect_mailed_at: p[1] };
      return { rows: [a], rowCount: 1 };
    }
    if (sql.startsWith('SELECT name, prefs FROM workspaces')) return { rows: [{ name: 'Harbor', prefs: { tz: 'Europe/London' } }], rowCount: 1 };
    if (sql.startsWith('SELECT p.scheduled_at FROM posts')) return { rows: p[0] === 'broken' ? [{ scheduled_at: t + 2 * 86400_000 }, { scheduled_at: t + 4 * 86400_000 }] : [], rowCount: 0 };
    if (sql.startsWith('SELECT u.email FROM workspace_members')) return { rows: [{ email: 'owner@harbor.test' }], rowCount: 1 };
    throw new Error('unexpected: ' + sql.slice(0, 90));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  // Capture the emails instead of sending them.
  process.env.RESEND_API_KEY = 're_test';
  process.env.RESEND_API_URL = 'https://resend.test/emails';
  const mails: any[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: string, init: any) => { mails.push(JSON.parse(init.body)); return new Response(JSON.stringify({ id: 'm' }), { status: 200 }); }) as any;
  try {
    const { sendReconnectAlerts } = await import('../lib/server/notify.ts');
    assert.equal(await sendReconnectAlerts(), 2);
    assert.deepEqual(mails.map((m) => m.to), [['owner@harbor.test'], ['owner@harbor.test']]);
    const broken = mails.find((m) => /Instagram/.test(m.subject));
    assert.match(broken.subject, /^Reconnect Instagram \(@harbor\.ig\): posts to it will fail$/);
    assert.match(broken.text, /Session expired/);
    assert.match(broken.text, /2 scheduled posts go to this account/);
    const soon = mails.find((m) => /LinkedIn/.test(m.subject));
    assert.match(soon.subject, /^Reconnect LinkedIn \(@Harbor\) before /);
    assert.match(soon.text, /Nothing is scheduled for it right now/);
    // A second run within the week sends nothing.
    assert.equal(await sendReconnectAlerts(), 0);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_URL;
  }
});
