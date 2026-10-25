import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THUMB_WIDTH, thumbUrlFor } from '../lib/server/media.ts';

test('images get a cached thumbnail URL through the optimizer; videos and GIFs do not', () => {
  const base = 'https://scheduleforyou.com';
  assert.equal(thumbUrlFor('med_a41c7e2093bd5f18', 'image/jpeg', base), `https://scheduleforyou.com/_next/image?url=%2Fm%2Fmed_a41c7e2093bd5f18&w=${THUMB_WIDTH}&q=75`);
  assert.match(thumbUrlFor('med_a41c7e2093bd5f18', 'image/png', base)!, /^https:\/\/scheduleforyou\.com\/_next\/image\?url=/);
  assert.ok(thumbUrlFor('med_a41c7e2093bd5f18', 'image/webp', base));
  assert.equal(thumbUrlFor('med_a41c7e2093bd5f18', 'image/gif', base), null);
  assert.equal(thumbUrlFor('med_a41c7e2093bd5f18', 'video/mp4', base), null);
  // A video gets one once it has a poster still, served from the same /m/ route.
  assert.equal(thumbUrlFor('med_a41c7e2093bd5f18', 'video/mp4', base, true), `https://scheduleforyou.com/_next/image?url=%2Fm%2Fmed_a41c7e2093bd5f18&w=${THUMB_WIDTH}&q=75`);
  assert.equal(thumbUrlFor('med_a41c7e2093bd5f18', 'image/gif', base, true), null);
  // 640 is one of Next's default device sizes, so the optimizer accepts it without extra config.
  assert.equal(THUMB_WIDTH, 640);
});
