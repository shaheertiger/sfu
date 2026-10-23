import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

/** In-memory accounts, posts and targets that understand the statements disconnectAccount runs. */
function fakeDb() {
  const db = {
    accounts: [{ id: 'gone', workspace_id: 'ws' }, { id: 'keep', workspace_id: 'ws' }, { id: 'other', workspace_id: 'ws2' }],
    posts: [
      { id: 'only', workspace_id: 'ws', status: 'scheduled' }, // its only target is on the disconnected account
      { id: 'both', workspace_id: 'ws', status: 'scheduled' }, // also goes to another account
      { id: 'part', workspace_id: 'ws', status: 'partial' }, // published elsewhere, failed on the disconnected one
      { id: 'pub', workspace_id: 'ws', status: 'published' }, // published on the disconnected one
      { id: 'foreign', workspace_id: 'ws2', status: 'scheduled' },
    ],
    targets: [
      { id: 't1', post_id: 'only', account_id: 'gone', status: 'pending' },
      { id: 't2', post_id: 'both', account_id: 'gone', status: 'pending' },
      { id: 't3', post_id: 'both', account_id: 'keep', status: 'pending' },
      { id: 't4', post_id: 'part', account_id: 'gone', status: 'failed' },
      { id: 't5', post_id: 'part', account_id: 'keep', status: 'published' },
      { id: 't6', post_id: 'pub', account_id: 'gone', status: 'published' },
      { id: 't7', post_id: 'foreign', account_id: 'gone', status: 'pending' },
    ],
  };
  const rows = (r: any[]) => ({ rows: r, rowCount: r.length });
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(sql)) return rows([]);
    if (sql.startsWith('DELETE FROM social_accounts')) {
      const hit = db.accounts.filter((a) => a.id === p[0] && a.workspace_id === p[1]);
      db.accounts = db.accounts.filter((a) => !hit.includes(a));
      return rows(hit.map((a) => ({ id: a.id })));
    }
    if (sql.startsWith('DELETE FROM post_targets t USING posts p')) {
      const ws = new Set(db.posts.filter((x) => x.workspace_id === p[1]).map((x) => x.id));
      const hit = db.targets.filter((t) => ws.has(t.post_id) && t.account_id === p[0] && t.status !== 'published');
      db.targets = db.targets.filter((t) => !hit.includes(t));
      return rows(hit.map((t) => ({ post_id: t.post_id })));
    }
    if (sql.startsWith("UPDATE posts p SET status='draft'")) {
      for (const x of db.posts) if (p[0].includes(x.id) && ['scheduled', 'failed', 'partial'].includes(x.status) && !db.targets.some((t) => t.post_id === x.id)) x.status = 'draft';
      return rows([]);
    }
    if (sql.startsWith("UPDATE posts p SET status='published'")) {
      for (const x of db.posts) if (p[0].includes(x.id) && x.status === 'partial' && !db.targets.some((t) => t.post_id === x.id && t.status !== 'published')) x.status = 'published';
      return rows([]);
    }
    throw new Error('unexpected query: ' + sql.slice(0, 100));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  return db;
}

test('disconnecting removes the account’s unpublished targets so its posts can be saved again', async () => {
  const { disconnectAccount } = await import('../lib/server/accounts.ts');
  const db = fakeDb();
  assert.equal(await disconnectAccount('ws', 'gone'), true);
  assert.deepEqual(db.targets.map((t) => t.id).sort(), ['t3', 't5', 't6', 't7']);
  const status = Object.fromEntries(db.posts.map((x) => [x.id, x.status]));
  assert.deepEqual(status, { only: 'draft', both: 'scheduled', part: 'published', pub: 'published', foreign: 'scheduled' });
});

test('an unknown account (or one in another workspace) changes nothing', async () => {
  const { disconnectAccount } = await import('../lib/server/accounts.ts');
  const db = fakeDb();
  assert.equal(await disconnectAccount('ws', 'other'), false);
  assert.equal(db.targets.length, 7);
});
