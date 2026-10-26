import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cryptoRandomInt, drawWinners, parseEntries, pickIndex, resultsText, splitNames } from '../lib/tools/giveaway.js';

/** An rng that replays fixed numbers (each taken modulo max). */
const seq = (...xs: number[]) => {
  let i = 0;
  return (max: number) => xs[i++ % xs.length] % max;
};

test('splits on lines and commas, trims and strips leading @', () => {
  assert.deepEqual(splitNames(' @alice \n\nbob, @@carol ,dave、＠eve\r\n'), ['alice', 'bob', 'carol', 'dave', 'eve']);
  assert.deepEqual(splitNames(''), []);
});

test('removes duplicates case-insensitively by default', () => {
  const r = parseEntries('@Alice\nalice\nBOB\nbob\nbob\ncarol\nＡＬＩＣＥ');
  assert.deepEqual(r.pool, [
    { name: 'Alice', weight: 1 },
    { name: 'BOB', weight: 1 },
    { name: 'carol', weight: 1 },
  ]);
  assert.equal(r.lines, 7);
  assert.equal(r.unique, 3);
  assert.equal(r.duplicates, 4);
});

test('weights by number of entries, or keeps every line', () => {
  const text = 'alice\nbob\nAlice\nalice';
  assert.deepEqual(parseEntries(text, { weight: true }).pool, [
    { name: 'alice', weight: 3 },
    { name: 'bob', weight: 1 },
  ]);
  assert.equal(parseEntries(text, { dedupe: false }).pool.length, 4);
});

test('exclude list drops names in any case, with or without @', () => {
  const r = parseEntries('me\nalice\nMe\nbob\nbrand_staff', { exclude: '@ME, Brand_Staff' });
  assert.deepEqual(r.pool.map((e) => e.name), ['alice', 'bob']);
  assert.equal(r.excluded, 3);
  assert.deepEqual(parseEntries('a\nb', { exclude: ['@A'] }).pool.map((e) => e.name), ['b']);
});

test('weighted pick walks the cumulative weights', () => {
  const pool = [{ name: 'a', weight: 3 }, { name: 'b', weight: 1 }];
  assert.equal(pickIndex(pool, () => 0), 0);
  assert.equal(pickIndex(pool, () => 2), 0);
  assert.equal(pickIndex(pool, () => 3), 1);
});

test('draws winners then alternates without replacement', () => {
  const pool = ['a', 'b', 'c', 'd', 'e'].map((name) => ({ name, weight: 1 }));
  const r = drawWinners(pool, { winners: 2, alternates: 2 }, seq(1, 0, 2, 0));
  // [a b c d e] → b; [a c d e] → a; [c d e] → e; [c d] → c
  assert.deepEqual(r, { winners: ['b', 'a'], alternates: ['e', 'c'] });
  assert.equal(pool.length, 5, 'does not mutate the pool');
  const all = drawWinners(pool, { winners: 20, alternates: 5 }, seq(0));
  assert.deepEqual(all, { winners: ['a', 'b', 'c', 'd', 'e'], alternates: [] });
  assert.deepEqual(drawWinners([], { winners: 3 }), { winners: [], alternates: [] });
});

test('a weighted entrant still wins only once', () => {
  const pool = [{ name: 'a', weight: 10 }, { name: 'b', weight: 1 }];
  assert.deepEqual(drawWinners(pool, { winners: 2 }, seq(0)), { winners: ['a', 'b'], alternates: [] });
});

test('crypto picks stay in range and cover every value', () => {
  const seen = new Set<number>();
  for (let i = 0; i < 2000; i++) {
    const n = cryptoRandomInt(7);
    assert.ok(n >= 0 && n < 7 && Number.isInteger(n));
    seen.add(n);
  }
  assert.equal(seen.size, 7);
  assert.equal(cryptoRandomInt(1), 0);
  const big = drawWinners(Array.from({ length: 300 }, (_, i) => ({ name: `u${i}`, weight: 1 })), { winners: 20, alternates: 5 });
  assert.equal(new Set([...big.winners, ...big.alternates]).size, 25);
});

test('results text lists winners and alternates', () => {
  const txt = resultsText({ winners: ['a', 'b'], alternates: ['c'] }, { when: '2026-10-26 12:00', entrants: '42 entrants' });
  assert.equal(txt, '2026-10-26 12:00\n42 entrants\n\nWinners:\n1. @a\n2. @b\n\nAlternates:\n1. @c');
});

test('first-word mode keeps only the username from pasted comments', () => {
  const { pool } = parseEntries('@maya love this! 😍\n@leo: count me in, please\n@Maya again\n\nsam_k 🙌', { firstWord: true });
  assert.deepEqual(pool.map((p) => p.name), ['maya', 'leo', 'sam_k']);
});
