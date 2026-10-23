import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverLayout, sourceRect, RATIOS } from '../lib/crop.js';

test('the image always covers the crop frame, however far it is dragged', () => {
  // 4000×3000 landscape photo in a 300×375 (4:5) frame.
  const l = coverLayout(4000, 3000, 300, 375, 1, 999, 999);
  assert.ok(l.w >= 300 && l.h >= 375);
  assert.equal(l.x, 0);
  assert.equal(l.y, 0);
  const far = coverLayout(4000, 3000, 300, 375, 1, -99999, -99999);
  assert.equal(Math.round(far.x + far.w), 300);
  assert.equal(Math.round(far.y + far.h), 375);
});

test('the source rectangle matches the frame ratio and stays inside the photo', () => {
  const l = coverLayout(4000, 3000, 300, 375, 1.5, -100, -50);
  const r = sourceRect(l, 300, 375);
  assert.ok(Math.abs(r.sw / r.sh - 300 / 375) < 1e-9);
  assert.ok(r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= 4000 + 1e-6 && r.sy + r.sh <= 3000 + 1e-6);
});

test('the presets are the sizes the platforms recommend', () => {
  const by = Object.fromEntries(RATIOS.map((r) => [r.id, r]));
  assert.deepEqual([by['1:1'].w, by['1:1'].h], [1080, 1080]);
  assert.deepEqual([by['4:5'].w, by['4:5'].h], [1080, 1350]);
  assert.deepEqual([by['9:16'].w, by['9:16'].h], [1080, 1920]);
});
