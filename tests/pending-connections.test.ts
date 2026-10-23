import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

// In-memory stand-in for the two tables these helpers touch.
function fakeDb(connected: string[] = []) {
  const pending = new Map<string, any>();
  const run = async (text: string, params: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (sql.startsWith('SELECT external_id FROM social_accounts')) return { rows: connected.filter((x) => params[2].includes(x)).map((external_id) => ({ external_id })), rowCount: 0 };
    if (sql.startsWith('DELETE FROM pending_connections WHERE created_at')) return { rows: [], rowCount: 0 };
    if (sql.startsWith('INSERT INTO pending_connections')) { pending.set(params[0], { id: params[0], workspace_id: params[1], platform: params[2], payload: params[3], created_at: params[4] }); return { rows: [], rowCount: 1 }; }
    if (sql.startsWith('SELECT * FROM pending_connections')) { const r = pending.get(params[0]); return { rows: r && r.workspace_id === params[1] ? [r] : [], rowCount: 1 }; }
    if (sql.startsWith('DELETE FROM pending_connections WHERE id')) { pending.delete(params[0]); return { rows: [], rowCount: 1 }; }
    throw new Error('unexpected query: ' + sql.slice(0, 80));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  return pending;
}

const page = (n: number) => ({ external_id: `p${n}`, username: `Page ${n}`, display_name: `Page ${n}`, avatar_url: `https://x.test/${n}.jpg`, access_token: `secret${n}` });

test('only accounts new to the workspace go to the picker', async () => {
  fakeDb(['p1']);
  const { splitNew } = await import('../lib/server/pending-connections.ts');
  const { known, fresh } = await splitNew('ws', 'facebook', [page(1), page(2), page(3)]);
  assert.deepEqual(known.map((a) => a.external_id), ['p1']);
  assert.deepEqual(fresh.map((a) => a.external_id), ['p2', 'p3']);
});

test('waiting accounts are stored encrypted, scoped to the workspace, and shown without tokens', async () => {
  const store = fakeDb();
  const { stashConnection, loadPending, pickerView } = await import('../lib/server/pending-connections.ts');
  const id = await stashConnection('ws', 'facebook', [page(1), page(2)]);
  const row = [...store.values()][0];
  assert.ok(!row.payload.includes('secret1'), 'tokens must not be stored in plain text');
  const back = await loadPending('ws', id);
  assert.equal(back!.accounts.length, 2);
  assert.equal(await loadPending('other_ws', id), null);
  const view = pickerView(back!.accounts[0]);
  assert.deepEqual(Object.keys(view).sort(), ['avatar', 'external_id', 'name', 'username']);
});
