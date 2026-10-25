import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../lib/server/http-error.ts';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

test('a target uses its own first comment, else the account default; "-" or false skips it', async () => {
  const { commentFor } = await import('../lib/server/publisher.ts');
  const acc = { meta: { default_first_comment: '#bakery #bristol' } };
  assert.equal(commentFor({ first_comment: 'Link: https://x.y/z' }, acc), 'Link: https://x.y/z');
  assert.equal(commentFor({}, acc), '#bakery #bristol');
  assert.equal(commentFor({ first_comment: '   ' }, acc), '#bakery #bristol');
  assert.equal(commentFor({ first_comment: ' - ' }, acc), null);
  assert.equal(commentFor({ first_comment: false }, acc), null);
  assert.equal(commentFor({}, { meta: {} }), null);
});

test('default comments are saved per account with the platform’s comment limit', async () => {
  const accounts: any[] = [{ id: 'ig', workspace_id: 'ws', platform: 'instagram', meta: {} }, { id: 'yt', workspace_id: 'ws', platform: 'youtube', meta: {} }];
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (sql.startsWith('SELECT id, platform FROM social_accounts')) return { rows: accounts.filter((a) => a.id === p[0] && a.workspace_id === p[1]), rowCount: 0 };
    if (sql.includes("jsonb_build_object('default_first_comment'")) { const a = accounts.find((x) => x.id === p[0]); a.meta = { ...a.meta, default_first_comment: p[1] }; return { rows: [a], rowCount: 1 }; }
    if (sql.includes("meta - 'default_first_comment'")) { const a = accounts.find((x) => x.id === p[0]); delete a.meta.default_first_comment; return { rows: [a], rowCount: 1 }; }
    throw new Error('unexpected: ' + sql.slice(0, 80));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  const { setDefaultFirstComment } = await import('../lib/server/accounts.ts');
  const { publicAccount } = await import('../lib/server/posts.ts');
  const saved = await setDefaultFirstComment('ws', 'ig', '  #bakery #bristol  ');
  assert.equal(saved.meta.default_first_comment, '#bakery #bristol');
  assert.equal(publicAccount(saved).default_first_comment, '#bakery #bristol');
  const cleared = await setDefaultFirstComment('ws', 'ig', '');
  assert.equal(cleared.meta.default_first_comment, undefined);
  assert.equal(publicAccount(cleared).default_first_comment, null);
  assert.equal(await setDefaultFirstComment('other', 'ig', 'x'), null);
  await assert.rejects(setDefaultFirstComment('ws', 'yt', '#shorts'), (e: any) => e instanceof HttpError && e.status === 422);
  await assert.rejects(setDefaultFirstComment('ws', 'ig', 'x'.repeat(2201)), (e: any) => e instanceof HttpError && e.status === 422 && /2200/.test(e.message));
});
