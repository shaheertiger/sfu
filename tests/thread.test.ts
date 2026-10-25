import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitThread, threadParts, isThread, firstComment, commentLimit, MAX_THREAD_PARTS } from '../lib/server/thread.ts';
import { withSignature } from '../lib/server/signature.ts';

test('a line holding only --- splits a caption into thread parts; blank parts are dropped', () => {
  assert.deepEqual(splitThread('One\n---\nTwo\n\n---\n\nThree'), ['One', 'Two', 'Three']);
  assert.deepEqual(splitThread('One\r\n --- \r\nTwo'), ['One', 'Two']);
  assert.deepEqual(splitThread('---\nOnly\n---'), ['Only']);
  assert.deepEqual(splitThread('No separator here'), ['No separator here']);
  // A --- inside a line (a dash, a table) is not a separator.
  assert.deepEqual(splitThread('Pros --- cons'), ['Pros --- cons']);
});

test('only X, Bluesky and Threads publish threads; elsewhere the caption stays one post', () => {
  const c = 'One\n---\nTwo';
  assert.equal(threadParts(c, 'x').length, 2);
  assert.equal(threadParts(c, 'bluesky').length, 2);
  assert.equal(threadParts(c, 'threads').length, 2);
  assert.deepEqual(threadParts(c, 'linkedin'), [c]);
  assert.equal(isThread(c, 'instagram'), false);
  assert.equal(MAX_THREAD_PARTS, 25);
});

test('first comments are trimmed, and each platform has its own comment limit', () => {
  assert.equal(firstComment({ first_comment: '  #bakery #sourdough  ' }), '#bakery #sourdough');
  assert.equal(firstComment({ first_comment: '   ' }), null);
  assert.equal(firstComment({ first_comment: 42 }), null);
  assert.equal(firstComment(null), null);
  assert.equal(commentLimit('instagram'), 2200);
  assert.equal(commentLimit('x'), 280);
  assert.equal(commentLimit('linkedin'), 1250);
});

test('the signature goes on the last part of a thread, and is skipped when that part would overflow', () => {
  assert.equal(withSignature('One\n---\nTwo', 'sig', 'x'), 'One\n---\nTwo\n\nsig');
  const long = 'x'.repeat(278);
  assert.equal(withSignature(`One\n---\n${long}`, 'sig', 'x'), `One\n---\n${long}`);
  // A thread on a platform without threads is one long post, so the usual rule applies.
  assert.equal(withSignature('One\n---\nTwo', 'sig', 'linkedin'), 'One\n---\nTwo\n\nsig');
});

test('validation checks each thread part and the first comment', async () => {
  process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);
  const accounts = [{ id: 'x1', platform: 'x', username: 'harbor' }, { id: 'yt', platform: 'youtube', username: 'harbortv' }];
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (sql.startsWith('SELECT id, mime, filename FROM media')) return { rows: [{ id: 'v', mime: 'video/mp4', filename: 'a.mp4' }], rowCount: 0 };
    if (sql.startsWith('SELECT id, platform, username FROM social_accounts')) return { rows: accounts.filter((a) => p[1].includes(a.id)), rowCount: 0 };
    if (sql.startsWith('SELECT a.id FROM')) return { rows: [], rowCount: 0 };
    throw new Error('unexpected query: ' + sql.slice(0, 80));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  const { validatePost } = await import('../lib/server/posts.ts');
  const ok = await validatePost('ws', { caption: `${'a'.repeat(270)}\n---\n${'b'.repeat(270)}`, targets: [{ account_id: 'x1' }] });
  assert.deepEqual(ok, []);
  const bad = await validatePost('ws', { caption: `short\n---\n${'b'.repeat(281)}`, targets: [{ account_id: 'x1' }] });
  assert.deepEqual(bad, ['X / Twitter (@harbor): part 2 of the thread is 281/280 characters']);
  const tooMany = await validatePost('ws', { caption: Array.from({ length: 26 }, (_, i) => `p${i}`).join('\n---\n'), targets: [{ account_id: 'x1' }] });
  assert.match(tooMany[0], /up to 25 posts/);
  const comment = await validatePost('ws', { caption: 'Hi', targets: [{ account_id: 'x1', options: { first_comment: 'c'.repeat(281) } }] });
  assert.deepEqual(comment, ['X / Twitter (@harbor): first comment 281/280 characters']);
  const unsupported = await validatePost('ws', { caption: 'Hi', media: ['v'], targets: [{ account_id: 'yt', options: { first_comment: 'hello', title: 'T' } }] });
  assert.deepEqual(unsupported, ['YouTube (@harbortv) cannot post a first comment']);
});
