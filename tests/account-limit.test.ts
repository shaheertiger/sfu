import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

// A tiny in-memory stand-in for Postgres that understands the queries connectAccounts runs.
type Row = { id: string; workspace_id: string; platform: string; external_id: string };
function fakeDb(limit: number, existing: Row[] = []) {
  const accounts = [...existing];
  const run = async (text: string, params: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(sql)) return { rows: [], rowCount: 0 };
    if (sql.startsWith('SELECT account_limit FROM workspaces')) return { rows: [{ account_limit: limit }], rowCount: 1 };
    if (sql.startsWith('SELECT COUNT(*)::int AS c FROM social_accounts')) return { rows: [{ c: accounts.filter((a) => a.workspace_id === params[0]).length }], rowCount: 1 };
    if (sql.startsWith('SELECT id FROM social_accounts WHERE workspace_id=$1 AND platform=$2 AND external_id=$3')) {
      const rows = accounts.filter((a) => a.workspace_id === params[0] && a.platform === params[1] && a.external_id === params[2]);
      return { rows, rowCount: rows.length };
    }
    if (sql.startsWith('INSERT INTO social_accounts')) {
      const [id, workspace_id, platform, external_id] = params;
      const i = accounts.findIndex((a) => a.id === id);
      const row = { id, workspace_id, platform, external_id };
      if (i >= 0) accounts[i] = row; else accounts.push(row);
      return { rows: [row], rowCount: 1 };
    }
    throw new Error('unexpected query: ' + sql.slice(0, 80));
  };
  const client = { query: run, release() {} };
  (globalThis as any).__sfyPool = { query: run, connect: async () => client };
  return accounts;
}

const page = (n: number) => ({ external_id: `page${n}`, username: `Page ${n}`, display_name: `Page ${n}`, access_token: 't' });

test('new accounts stop at the plan limit and the rest are skipped', async () => {
  const { connectAccounts } = await import('../lib/server/accounts.ts');
  const accounts = fakeDb(15, Array.from({ length: 10 }, (_, i) => ({ id: `acc${i}`, workspace_id: 'ws', platform: 'x', external_id: `x${i}` })));
  const r = await connectAccounts('ws', 'facebook', Array.from({ length: 25 }, (_, i) => page(i)));
  assert.equal(r.added, 5);
  assert.equal(r.skipped, 20);
  assert.equal(r.limit, 15);
  assert.equal(accounts.length, 15);
});

test('reconnecting accounts that are already connected works even at the limit', async () => {
  const { connectAccounts, upsertAccount } = await import('../lib/server/accounts.ts');
  fakeDb(2, [
    { id: 'a1', workspace_id: 'ws', platform: 'facebook', external_id: 'page1' },
    { id: 'a2', workspace_id: 'ws', platform: 'facebook', external_id: 'page2' },
  ]);
  const r = await connectAccounts('ws', 'facebook', [page(1), page(2), page(3)]);
  assert.equal(r.updated, 2);
  assert.equal(r.added, 0);
  assert.equal(r.skipped, 1);
  await assert.rejects(() => upsertAccount('ws', 'facebook', page(9)), /allows 2 connected accounts/);
});
