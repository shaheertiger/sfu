import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isConnectionError, query } from '../lib/server/db.ts';

/** A fake pool whose query fails with `errs` in order, then answers. Records every statement it was sent. */
function fakePool(errs: any[]) {
  const sent: string[] = [];
  (globalThis as any).__sfyPool = {
    query: async (text: string) => {
      sent.push(text);
      const e = errs.shift();
      if (e) throw e;
      return { rows: [{ ok: 1 }], rowCount: 1 };
    },
  };
  return sent;
}
const dropped = () => Object.assign(new Error('Connection terminated unexpectedly'), {});
afterEach(() => delete (globalThis as any).__sfyPool);

test('connection-level failures are told apart from errors in the query', () => {
  assert.equal(isConnectionError({ code: 'ECONNRESET' }), true);
  assert.equal(isConnectionError({ code: '57P01', message: 'terminating connection due to administrator command' }), true);
  assert.equal(isConnectionError(new Error('Connection terminated unexpectedly')), true);
  assert.equal(isConnectionError(new Error('timeout exceeded when trying to connect')), false);
  assert.equal(isConnectionError({ code: '42601', message: 'syntax error at or near "SELEC"' }), false);
  assert.equal(isConnectionError({ code: '23505', message: 'duplicate key value' }), false);
  assert.equal(isConnectionError(null), false);
});

test('a read that loses its connection is tried once more', async () => {
  const sent = fakePool([dropped()]);
  assert.deepEqual(await query('SELECT * FROM posts WHERE id=$1', ['p1']), [{ ok: 1 }]);
  assert.equal(sent.length, 2);
});

test('a read that keeps failing gives up after the second try', async () => {
  const sent = fakePool([dropped(), dropped()]);
  await assert.rejects(query('SELECT 1'), /Connection terminated/);
  assert.equal(sent.length, 2);
});

test('writes and locking reads are never repeated', async () => {
  for (const sql of [
    "UPDATE posts SET status='publishing' WHERE id=$1 RETURNING id",
    'INSERT INTO posts (id) VALUES ($1) RETURNING id',
    'WITH x AS (DELETE FROM posts WHERE id=$1 RETURNING id) SELECT * FROM x',
    'SELECT id FROM posts WHERE id=$1 FOR UPDATE',
  ]) {
    const sent = fakePool([dropped()]);
    await assert.rejects(query(sql, ['p1']), /Connection terminated/, sql);
    assert.equal(sent.length, 1, sql);
  }
});

test('an error in the query itself is not retried', async () => {
  const sent = fakePool([Object.assign(new Error('relation "postz" does not exist'), { code: '42P01' })]);
  await assert.rejects(query('SELECT * FROM postz'), /does not exist/);
  assert.equal(sent.length, 1);
});
