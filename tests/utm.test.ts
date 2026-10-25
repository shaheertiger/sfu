import { test } from 'node:test';
import assert from 'node:assert/strict';
import { campaignSlug, withUtm } from '../lib/server/links.ts';

test('UTM tags are added without touching tags the link already has', () => {
  assert.equal(withUtm('https://example.com/menu', { source: 'instagram', campaign: 'autumn-launch' }), 'https://example.com/menu?utm_source=instagram&utm_medium=social&utm_campaign=autumn-launch');
  assert.equal(withUtm('https://example.com/menu?utm_source=newsletter&x=1', { source: 'x', campaign: null }), 'https://example.com/menu?utm_source=newsletter&x=1&utm_medium=social');
  assert.equal(withUtm('https://example.com/menu', null), 'https://example.com/menu');
  assert.equal(withUtm('not a url', { source: 'x' }), 'not a url');
});

test('labels become safe campaign names', () => {
  assert.equal(campaignSlug('Autumn Launch 2026!'), 'autumn-launch-2026');
  assert.equal(campaignSlug('  Café & Bar  '), 'cafe-bar');
  assert.equal(campaignSlug(''), null);
  assert.equal(campaignSlug(undefined), null);
});
