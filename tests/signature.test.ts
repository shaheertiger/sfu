import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withSignature } from '../lib/server/signature.ts';

test('adds the signature on its own paragraph', () => {
  assert.equal(withSignature('Hello world', 'Follow us', 'bluesky'), 'Hello world\n\nFollow us');
});

test('an empty caption becomes just the signature', () => {
  assert.equal(withSignature('   ', 'Follow us', 'x'), 'Follow us');
});

test('does nothing when there is no signature or it is already there', () => {
  assert.equal(withSignature('Hello', '', 'x'), 'Hello');
  assert.equal(withSignature('Hello\n\nFollow us', 'Follow us', 'x'), 'Hello\n\nFollow us');
});

test('is skipped when it would push the post over the platform limit', () => {
  const caption = 'a'.repeat(275);
  assert.equal(withSignature(caption, 'Follow us', 'x'), caption); // X: 280
  assert.equal(withSignature(caption, 'Follow us', 'linkedin').endsWith('Follow us'), true);
});
