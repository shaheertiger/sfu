import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from '../lib/server/rss.ts';

test('fills placeholders and strips HTML from descriptions', () => {
  const out = renderTemplate('{title}\n\n{description}\n{link}', {
    title: 'New &amp; improved',
    link: 'https://example.com/post',
    description: '<p>Hello <b>world</b>&nbsp;&amp; friends</p>',
  });
  assert.equal(out, 'New & improved\n\nHello world & friends\nhttps://example.com/post');
});

test('long descriptions are cut at 280 characters with an ellipsis', () => {
  const out = renderTemplate('{description}', { description: 'x'.repeat(500) });
  assert.equal(out.length, 280);
  assert.ok(out.endsWith('…'));
});

test('missing fields render as empty, extra blank lines collapse', () => {
  assert.equal(renderTemplate('{title}\n\n\n\n{link}', {}), '');
});
