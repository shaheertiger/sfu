import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

/** Media and accounts for validatePost's three queries. */
function fakeDb(media: { id: string; mime: string; filename: string }[]) {
  const accounts = [
    { id: 'ig', platform: 'instagram', username: 'harbor.ig' },
    { id: 'fb', platform: 'facebook', username: 'Harbor' },
    { id: 'bs', platform: 'bluesky', username: 'harbor.bsky' },
  ];
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (sql.startsWith('SELECT id, mime, filename FROM media')) return { rows: media.filter((m) => p[1].includes(m.id)), rowCount: 0 };
    if (sql.startsWith('SELECT id, platform, username FROM social_accounts')) return { rows: accounts.filter((a) => p[1].includes(a.id)), rowCount: 0 };
    if (sql.startsWith('SELECT a.id FROM')) return { rows: [], rowCount: 0 };
    throw new Error('unexpected query: ' + sql.slice(0, 80));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
}

test('Instagram targets need JPEG images, and say which file to convert', async () => {
  const { validatePost } = await import('../lib/server/posts.ts');
  fakeDb([{ id: 'm1', mime: 'image/png', filename: 'menu.png' }, { id: 'm2', mime: 'image/jpeg', filename: 'cake.jpg' }]);
  const errors = await validatePost('ws', { caption: 'Hi', media: ['m1', 'm2'], targets: [{ account_id: 'ig' }, { account_id: 'bs' }] });
  assert.deepEqual(errors, ['Instagram only accepts JPEG images. Convert menu.png to JPEG or deselect @harbor.ig.']);
  fakeDb([{ id: 'm2', mime: 'image/jpeg', filename: 'cake.jpg' }]);
  assert.deepEqual(await validatePost('ws', { caption: 'Hi', media: ['m2'], targets: [{ account_id: 'ig' }] }), []);
});

test('a Facebook post can have a video or images, not both (Reels and Stories have their own rules)', async () => {
  const { validatePost } = await import('../lib/server/posts.ts');
  fakeDb([{ id: 'v', mime: 'video/mp4', filename: 'clip.mp4' }, { id: 'i', mime: 'image/jpeg', filename: 'a.jpg' }]);
  const errors = await validatePost('ws', { caption: 'Hi', media: ['v', 'i'], targets: [{ account_id: 'fb' }] });
  assert.deepEqual(errors, ['Facebook (@Harbor): A post can have a video or images, not both.']);
  const reel = await validatePost('ws', { caption: 'Hi', media: ['v', 'i'], targets: [{ account_id: 'fb', options: { format: 'reel' } }] });
  assert.deepEqual(reel, ['Facebook (@Harbor): A Reel needs exactly one video.']);
});
