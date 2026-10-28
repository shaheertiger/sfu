import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FREE_PLAN, paidOnlyMessage } from '../lib/plan-limits.js';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);
// Free limits only apply with billing on (no Stripe calls are made here).
process.env.STRIPE_SECRET_KEY = 'sk_test_x';

test('Free refuses turning on paid post options, but keeps what a post already had', async () => {
  const { freePlanProblem } = await import('../lib/server/posts.ts');
  assert.equal(freePlanProblem({ repeat: 'weekly' }, null, 'scheduled'), paidOnlyMessage('repeat'));
  assert.equal(freePlanProblem({ evergreen: true }, null, 'scheduled'), paidOnlyMessage('repeat'));
  assert.equal(freePlanProblem({ approval: 'pending' }, null, 'scheduled'), paidOnlyMessage('approvals'));
  assert.equal(freePlanProblem({ batch: 'b1' }, null, 'draft'), paidOnlyMessage('bulk'), 'bulk is refused even as drafts');
  // Drafts can hold them; they're checked when the post is scheduled.
  assert.equal(freePlanProblem({ repeat: 'weekly', evergreen: true, approval: 'pending' }, null, 'draft'), null);
  // A post made on a paid plan can still be edited with its options as they were.
  const existing = { repeat: 'weekly', evergreen: true, approval: 'pending', batch: 'b1' };
  assert.equal(freePlanProblem({ repeat: 'weekly', evergreen: true, approval: 'pending', batch: 'b1', caption: 'edited' }, existing, 'scheduled'), null);
  assert.equal(freePlanProblem({ repeat: 'none', evergreen: false, approval: 'approved' }, null, 'scheduled'), null);
});

/** Just enough Postgres for savePost to reach the queue check. */
function fakeDb(status: string | null, queued: number) {
  const writes: string[] = [];
  const run = async (text: string) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(sql)) return { rows: [], rowCount: 0 };
    if (sql.startsWith('SELECT * FROM posts WHERE id=$1')) return { rows: [], rowCount: 0 };
    if (sql.startsWith('SELECT * FROM workspaces WHERE id=$1')) return { rows: [{ id: 'ws', subscription_status: status, account_limit: 3 }], rowCount: 1 };
    if (sql.startsWith('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE')) return { rows: [{ id: 'ws' }], rowCount: 1 };
    if (sql.startsWith('SELECT COUNT(*)::int AS c FROM posts')) return { rows: [{ c: queued }], rowCount: 1 };
    writes.push(sql);
    return { rows: [], rowCount: 1 };
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  return writes;
}

const future = () => Date.now() + 86400000;

test(`Free holds ${FREE_PLAN.queueLimit} scheduled posts; drafts and paid plans aren't limited`, async () => {
  const { savePost } = await import('../lib/server/posts.ts');
  let writes = fakeDb(null, FREE_PLAN.queueLimit);
  await assert.rejects(
    savePost('ws', { id: 'p1', caption: 'Hi', status: 'scheduled', scheduled_at: future() }, 'u1'),
    (e: any) => e.status === 402 && /up to 10 scheduled posts/.test(e.message),
  );
  assert.equal(writes.length, 0, 'nothing is saved');

  writes = fakeDb(null, FREE_PLAN.queueLimit - 1);
  await savePost('ws', { id: 'p1', caption: 'Hi', status: 'scheduled', scheduled_at: future() }, 'u1').catch(() => {});
  assert.ok(writes.some((w) => w.startsWith('INSERT INTO posts')), 'the 10th post is saved');

  writes = fakeDb(null, 50);
  await savePost('ws', { id: 'p1', caption: 'Hi', status: 'draft' }, 'u1').catch(() => {});
  assert.ok(writes.some((w) => w.startsWith('INSERT INTO posts')), 'drafts never count');

  writes = fakeDb('active', 500);
  await savePost('ws', { id: 'p1', caption: 'Hi', status: 'scheduled', scheduled_at: future() }, 'u1').catch(() => {});
  assert.ok(writes.some((w) => w.startsWith('INSERT INTO posts')), 'paid plans have no queue limit');
});
