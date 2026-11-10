import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META_DESCRIPTION, snippet } from '../lib/seo.js';
import { pageMetadata } from '../lib/seo-pages.js';

test('short descriptions are left alone', () => {
  assert.equal(snippet('Free character counter for X posts.'), 'Free character counter for X posts.');
});

test('long descriptions end at the last full sentence that fits', () => {
  const s = 'A'.repeat(120) + '. Then a second sentence that pushes the whole thing well past the limit Google shows.';
  assert.equal(snippet(s), 'A'.repeat(120) + '.');
});

test('without a usable sentence end, they stop at a word with an ellipsis', () => {
  const s = 'word '.repeat(60).trim();
  const out = snippet(s);
  assert.ok(out.length <= 161, String(out.length));
  assert.ok(out.endsWith('word…'), out.slice(-10));
});

test('the homepage snippet fits in a search result', () => {
  assert.ok(META_DESCRIPTION.length <= 160, String(META_DESCRIPTION.length));
});

test('the brand suffix is added only when the whole title still fits', () => {
  assert.equal(pageMetadata({ title: 'Instagram Font Generator', description: 'x', path: '/tools/x' } as any).title, 'Instagram Font Generator');
  const long = 'Is Bluesky Safe? Yes, With 2 Catches: Almost Everything Is Public';
  assert.deepEqual(pageMetadata({ title: long, description: 'x', path: '/blog/x' } as any).title, { absolute: long });
});

test('fitTitle takes the first version that fits, and Title Case keeps small words small', async () => {
  const { fitTitle, titleCase, TITLE_MAX } = await import('../lib/fit-title.js');
  assert.equal(fitTitle('x'.repeat(TITLE_MAX + 1), 'short one', 'shorter'), 'short one');
  assert.equal(fitTitle('x'.repeat(80), 'y'.repeat(70)), 'y'.repeat(70));
  assert.equal(titleCase('accounting firms'), 'Accounting Firms');
  assert.equal(titleCase('weekend and community'), 'Weekend and Community');
});

test('every blog post title fits in a search result', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  for (const f of readdirSync('content/blog').filter((n) => n.endsWith('.md'))) {
    const title = (readFileSync(`content/blog/${f}`, 'utf8').match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || '';
    assert.ok(Array.from(title).length <= 65, `${f}: ${title.length} characters`);
  }
});
