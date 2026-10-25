import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CODE_RE, findUrls, isTrackable, newCode, recordClick, shortenLinks } from '../lib/server/links.ts';

test('links are found without the punctuation that follows them', () => {
  assert.deepEqual(findUrls('See https://example.com/menu, and (https://example.com/hours). Also https://example.com/menu'), ['https://example.com/menu', 'https://example.com/hours']);
  assert.deepEqual(findUrls('no links'), []);
});

test('only real, long-enough links are swapped; our own short links never are', () => {
  const base = 'https://scheduleforyou.com/l/';
  assert.equal(isTrackable('https://example.com/our-autumn-menu-is-here', base), true);
  assert.equal(isTrackable('https://scheduleforyou.com/l/abc1234', base), false);
  assert.equal(isTrackable('https://x.co/a', base), false); // shorter than a short link
  assert.equal(isTrackable('https://localhost/path/that/is/long/enough', base), false);
  assert.equal(isTrackable('ftp://example.com/some/long/path/here', base), false);
});

test('codes are unambiguous and the same link on a target reuses its code', async () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  for (let i = 0; i < 50; i++) assert.match(newCode(), /^[a-km-zA-HJ-NP-Z2-9]{7}$/);
  const links: any[] = [];
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ');
    if (sql.startsWith('SELECT code FROM links')) return { rows: links.filter((l) => l.target_id === p[0] && l.url === p[1]), rowCount: 0 };
    if (sql.startsWith('INSERT INTO links')) { links.push({ code: p[0], target_id: p[3], url: p[4], clicks: 0 }); return { rows: [{ code: p[0] }], rowCount: 1 }; }
    if (sql.startsWith('UPDATE links SET clicks')) { const l = links.find((x) => x.code === p[0]); if (!l) return { rows: [], rowCount: 0 }; l.clicks++; return { rows: [{ url: l.url, target_id: l.target_id }], rowCount: 1 }; }
    if (sql.startsWith('UPDATE post_targets SET stats')) return { rows: [], rowCount: 1 };
    throw new Error('unexpected: ' + sql.slice(0, 60));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  const ctx = { workspaceId: 'ws', postId: 'p', targetId: 't' };
  const a = await shortenLinks('Menu: https://example.com/our-autumn-menu-is-here (link in bio)', ctx);
  const b = await shortenLinks('Again https://example.com/our-autumn-menu-is-here.', ctx);
  const code = a.split('/l/')[1].split(' ')[0];
  assert.match(code, CODE_RE);
  assert.equal(a, `Menu: https://scheduleforyou.com/l/${code} (link in bio)`);
  assert.equal(b, `Again https://scheduleforyou.com/l/${code}.`);
  assert.equal(links.length, 1);
  assert.equal(await recordClick(code), 'https://example.com/our-autumn-menu-is-here');
  assert.equal(links[0].clicks, 1);
  assert.equal(await recordClick('nope'), null);
  assert.equal(await recordClick('zzzzzzz'), null);
  delete process.env.APP_URL;
});
