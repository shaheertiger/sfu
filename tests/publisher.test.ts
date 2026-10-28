import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTERS } from '../lib/server/adapters/index.ts';
import { PublishError } from '../lib/server/adapters/types.ts';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

/*
 * An in-memory stand-in for Postgres that understands the statements publishPost runs, so its
 * bookkeeping (attempts, progress, statuses) can be checked without a database.
 */
type Target = { id: string; post_id: string; account_id: string; status: string; attempts: number; error: string | null; progress: Record<string, any>; options: any; caption_override: string | null; failed_at?: number | null; external_id?: string };
function fakeDb(targets: Partial<Target>[], post: Record<string, any> = {}) {
  const db = {
    post: { id: 'post1', workspace_id: 'ws', caption: 'Hello', media: [], status: 'publishing', scheduled_at: Date.now() - 1000, repeat: 'none', evergreen: false, signature: false, ...post } as Record<string, any>,
    targets: targets.map((t, i) => ({ id: `t${i + 1}`, post_id: 'post1', account_id: 'acc1', status: 'pending', attempts: 0, error: null, progress: {}, options: {}, caption_override: null, ...t })) as Target[],
    accounts: [{ id: 'acc1', workspace_id: 'ws', platform: 'x', username: 'harbor', access_token: null, refresh_token: null, token_expires_at: null, meta: {}, status: 'active', last_error: null as string | null }],
    sql: [] as string[],
    workspace: {} as Record<string, any>,
  };
  const tgt = (id: string) => db.targets.find((t) => t.id === id)!;
  const rows = (r: any[]) => ({ rows: r, rowCount: r.length });
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    db.sql.push(sql);
    if (sql.startsWith('SELECT * FROM posts WHERE id=$1')) return rows([{ ...db.post }]);
    if (sql.startsWith('SELECT * FROM post_targets WHERE post_id=$1')) return rows(db.targets.map((t) => ({ ...t, progress: { ...t.progress } })));
    if (sql.startsWith('SELECT status FROM post_targets')) return rows(db.targets.map((t) => ({ status: t.status })));
    if (sql.startsWith('SELECT a.id FROM') || sql.startsWith('SELECT id FROM ( SELECT id, ROW_NUMBER()')) return rows([]);
    if (sql.startsWith('SELECT * FROM workspaces WHERE id=$1')) return rows([{ id: 'ws', name: 'WS', prefs: { alerts: { fail: false } }, signature: '', ...db.workspace }]);
    if (sql.startsWith('SELECT * FROM social_accounts WHERE id=$1')) return rows(db.accounts.filter((a) => a.id === p[0]));
    if (sql.startsWith('SELECT platform, username FROM social_accounts')) return rows(db.accounts.filter((a) => a.id === p[0]));
    if (sql.startsWith('SELECT name, prefs FROM workspaces')) return rows([{ name: 'WS', prefs: { alerts: { fail: false } } }]);
    if (sql.startsWith('SELECT') && sql.includes('FROM webhooks')) return rows([]);
    if (sql.startsWith("UPDATE post_targets SET status='publishing', attempts=attempts+1")) { const t = tgt(p[0]); t.status = 'publishing'; t.attempts++; return rows([]); }
    if (sql.startsWith('UPDATE post_targets SET progress =')) { Object.assign(tgt(p[1]).progress, JSON.parse(p[0])); return rows([]); }
    if (sql.startsWith("UPDATE post_targets SET status='published'")) { const t = tgt(p[3]); Object.assign(t, { status: 'published', external_id: p[0], error: null, progress: {} }); return rows([]); }
    if (sql.startsWith("UPDATE post_targets SET status='pending', attempts=GREATEST(attempts-1, 0), error=$1")) {
      const t = tgt(p[2]); Object.assign(t, { status: 'pending', attempts: Math.max(t.attempts - 1, 0), error: p[0] }); Object.assign(t.progress, JSON.parse(p[1])); return rows([]);
    }
    if (sql.startsWith("UPDATE post_targets SET status='pending', attempts=GREATEST(attempts-1, 0)")) { const t = tgt(p[0]); t.status = 'pending'; t.attempts = Math.max(t.attempts - 1, 0); return rows([]); }
    if (sql.startsWith("UPDATE post_targets SET status='failed'")) { Object.assign(tgt(p[2]), { status: 'failed', error: p[0], failed_at: p[1] }); return rows([]); }
    if (sql.startsWith('UPDATE post_targets SET status=$1, error=$2, failed_at=$3')) {
      const t = tgt(p[3]); Object.assign(t, { status: p[0], error: p[1], failed_at: p[2] }); delete t.progress.sending; return rows([]);
    }
    if (sql.startsWith("UPDATE social_accounts SET status='error'")) { Object.assign(db.accounts.find((a) => a.id === p[1])!, { status: 'error', last_error: p[0] }); return rows([]); }
    if (sql.startsWith('UPDATE posts SET status=$1, scheduled_at=CASE')) { db.post.status = p[0]; if (p[0] === 'scheduled') db.post.scheduled_at = p[1]; return rows([]); }
    throw new Error('unexpected query: ' + sql.slice(0, 120));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  return db;
}

const realX = ADAPTERS.x;
afterEach(() => { ADAPTERS.x = realX; });
function fakeX(publish: (input: any) => Promise<any>) {
  let calls = 0;
  ADAPTERS.x = { platform: 'x', publish: async (input: any) => { calls++; return publish(input); } } as any;
  return () => calls;
}
const quietly = async <T>(fn: () => Promise<T>) => {
  const err = console.error;
  console.error = () => {};
  try { return await fn(); } finally { console.error = err; }
};

test('a target is only started with enough time left; the rest wait for the next run without using an attempt', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  const db = fakeDb([{}, {}]);
  const calls = fakeX(async () => ({ externalId: '1' }));
  const status = await publishPost('post1', { deadline: Date.now() + 20_000 });
  assert.equal(status, 'scheduled');
  assert.equal(calls(), 0);
  assert.deepEqual(db.targets.map((t) => [t.status, t.attempts]), [['pending', 0], ['pending', 0]]);
  assert.ok(db.post.scheduled_at <= Date.now(), 'goes straight back to the queue');
});

test('a pending target that already used every attempt (a crash loop) fails instead of retrying forever', async () => {
  const { publishPost, MAX_ATTEMPTS } = await import('../lib/server/publisher.ts');
  const db = fakeDb([{ attempts: MAX_ATTEMPTS }]);
  const calls = fakeX(async () => ({ externalId: '1' }));
  assert.equal(await publishPost('post1'), 'failed');
  assert.equal(calls(), 0);
  assert.equal(db.targets[0].status, 'failed');
  assert.match(db.targets[0].error!, /interrupted 3 times/);
});

test('a target whose last attempt was cut off after sending is not sent again', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  const db = fakeDb([{ progress: { sending: Date.now() - 60_000 }, attempts: 1 }]);
  const calls = fakeX(async () => ({ externalId: '1' }));
  assert.equal(await publishPost('post1'), 'failed');
  assert.equal(calls(), 0);
  assert.match(db.targets[0].error!, /may already be live/);
});

test('no answer after sending fails the target for a person to check; an error answer is retried', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  let db = fakeDb([{}]);
  fakeX(async (input) => { await input.sending(); throw new PublishError('api.x.com did not answer in time', true, { uncertain: true }); });
  assert.equal(await quietly(() => publishPost('post1')), 'failed');
  assert.match(db.targets[0].error!, /didn't confirm the post .*may already be live/);

  db = fakeDb([{}]);
  fakeX(async (input) => { await input.sending(); throw new PublishError('The platform had a temporary problem.', true, { status: 503 }); });
  assert.equal(await quietly(() => publishPost('post1')), 'scheduled');
  assert.equal(db.targets[0].status, 'pending');
  assert.equal(db.targets[0].attempts, 1);
  assert.equal(db.targets[0].progress.sending, undefined, 'the sending mark is cleared, so the retry can go ahead');
});

test('media still processing waits without using up attempts, and resumes with the saved progress', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  const db = fakeDb([{}]);
  const seen: any[] = [];
  fakeX(async (input) => {
    seen.push(input.progress);
    if (!input.progress.ig) await input.save({ ig: { container: 'c1', at: Date.now() } });
    throw new PublishError('Instagram is still processing the media.', true, { processing: true });
  });
  for (let i = 0; i < 4; i++) assert.equal(await quietly(() => publishPost('post1')), 'scheduled');
  assert.equal(db.targets[0].attempts, 0);
  assert.equal(db.targets[0].progress.waits, 4);
  assert.equal(seen[1].ig.container, 'c1', 'the next attempt gets the saved container');
});

test('a sign-in problem marks the account for reconnecting; a permission problem does not', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  let db = fakeDb([{}]);
  fakeX(async () => { throw new PublishError('Requires pages_manage_posts permission', false, { status: 403, auth: false }); });
  await quietly(() => publishPost('post1'));
  assert.equal(db.accounts[0].status, 'active');
  db = fakeDb([{}]);
  fakeX(async () => { throw new PublishError('Error validating access token', false, { status: 400, auth: true }); });
  await quietly(() => publishPost('post1'));
  assert.equal(db.accounts[0].status, 'error');
});

test('a post with no targets left (accounts disconnected) goes back to drafts instead of "published"', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  const db = fakeDb([]);
  assert.equal(await publishPost('post1'), 'draft');
  assert.equal(db.post.status, 'draft');
});

test('tokens are renewed when they need it: refresh tokens near expiry, Threads a week ahead, old Instagram user tokens', async () => {
  const { needsRefresh } = await import('../lib/server/publisher.ts');
  const t = Date.now();
  assert.equal(needsRefresh({ platform: 'x', refresh_token: 'r', token_expires_at: t + 60_000, meta: {} }, t), true);
  assert.equal(needsRefresh({ platform: 'x', refresh_token: 'r', token_expires_at: t + 3600_000, meta: {} }, t), false);
  assert.equal(needsRefresh({ platform: 'threads', refresh_token: null, token_expires_at: t + 5 * 864e5, meta: {} }, t), true);
  assert.equal(needsRefresh({ platform: 'threads', refresh_token: null, token_expires_at: t + 30 * 864e5, meta: {} }, t), false);
  assert.equal(needsRefresh({ platform: 'instagram', refresh_token: null, token_expires_at: null, meta: { page_id: 'p' } }, t), true);
  assert.equal(needsRefresh({ platform: 'instagram', refresh_token: null, token_expires_at: null, meta: { page_id: 'p', token_kind: 'page' } }, t), false);
  assert.equal(needsRefresh({ platform: 'linkedin', refresh_token: null, token_expires_at: t + 60_000, meta: {} }, t), false);
});

test('accounts say whether they renew themselves; only expiries a person must act on are shown', async () => {
  const { publicAccount } = await import('../lib/server/posts.ts');
  const t = Date.now() + 864e5;
  const base = { id: 'a', username: 'u', meta: {}, token_expires_at: t };
  assert.deepEqual([publicAccount({ ...base, platform: 'x', refresh_token: 'enc' })].map((a) => [a.has_refresh, a.token_expires_at]), [[true, null]]);
  assert.deepEqual([publicAccount({ ...base, platform: 'threads' })].map((a) => [a.has_refresh, a.token_expires_at]), [[true, null]]);
  assert.deepEqual([publicAccount({ ...base, platform: 'instagram', meta: { token_kind: 'page' } })].map((a) => [a.has_refresh, a.token_expires_at]), [[true, null]]);
  assert.deepEqual([publicAccount({ ...base, platform: 'linkedin' })].map((a) => [a.has_refresh, a.token_expires_at]), [[false, t]]);
  assert.equal('user_token' in publicAccount({ ...base, platform: 'facebook', meta: { user_token: 'secret' } }).meta, false);
});

test('a Free workspace’s posts end with a link back to us when it fits; paid posts go out as written', async () => {
  const { publishPost } = await import('../lib/server/publisher.ts');
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  try {
    const captions: string[] = [];
    fakeX(async (input) => { captions.push(input.caption); await input.sending(); return { externalId: 'tw1' }; });

    let db = fakeDb([{}]);
    db.workspace = { subscription_status: null };
    await quietly(() => publishPost('post1'));
    assert.equal(captions[0], 'Hello\n\nScheduled with Schedule For You: https://scheduleforyou.com');

    db = fakeDb([{}], { caption: 'x'.repeat(270) });
    db.workspace = { subscription_status: null };
    await quietly(() => publishPost('post1'));
    assert.equal(captions[1], 'x'.repeat(270), 'left off when it would push the post past the limit');

    db = fakeDb([{}]);
    db.workspace = { subscription_status: 'active' };
    await quietly(() => publishPost('post1'));
    assert.equal(captions[2], 'Hello');
  } finally {
    delete process.env.STRIPE_SECRET_KEY;
  }
});
