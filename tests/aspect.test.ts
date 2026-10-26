import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMMON_RATIOS, RATIO_CHIPS, SOCIAL_SIZES, gcd, nearestRatio, parseRatio, ratioFromSize, simplify, solveSide } from '../lib/tools/aspect.js';

test('gcd and simplify', () => {
  assert.equal(gcd(1920, 1080), 120);
  assert.equal(gcd(7, 0), 7);
  assert.deepEqual(simplify(1920, 1080), [16, 9]);
  assert.deepEqual(simplify(1080, 1350), [4, 5]);
  assert.deepEqual(simplify(1366, 768), [683, 384]);
  assert.equal(simplify(0, 10), null);
  assert.equal(simplify(-4, 3), null);
});

test('ratio from a size: label, decimal, nearest named ratio, orientation', () => {
  const r = ratioFromSize(1920, 1080)!;
  assert.equal(r.label, '16:9');
  assert.equal(r.decimal.toFixed(4), '1.7778');
  assert.equal(r.nearest!.id, '16:9');
  assert.equal(r.nearest!.exact, true);
  assert.equal(r.orientation, 'landscape');
  const ig = ratioFromSize(1080, 566)!;
  assert.equal(ig.label, '540:283');
  assert.equal(ig.nearest!.id, '1.91:1');
  assert.equal(ig.nearest!.exact, true);
  assert.equal(ratioFromSize(1366, 768)!.nearest!.exact, true, 'within 1% counts as the named ratio');
  const odd = ratioFromSize(1100, 600)!;
  assert.equal(odd.label, '11:6');
  assert.equal(odd.nearest!.id, '16:9');
  assert.equal(odd.nearest!.exact, false);
  assert.equal(ratioFromSize(1080, 1920)!.nearest!.id, '9:16');
  assert.equal(ratioFromSize(500, 500)!.orientation, 'square');
  assert.equal(ratioFromSize(1000, 1500)!.orientation, 'portrait');
  assert.equal(ratioFromSize(0, 5), null);
  assert.equal(nearestRatio(NaN), null);
});

test('parse ratios in the forms people type', () => {
  assert.deepEqual(parseRatio('16:9'), { w: 16, h: 9 });
  assert.deepEqual(parseRatio(' 4 / 5 '), { w: 4, h: 5 });
  assert.deepEqual(parseRatio('16x9'), { w: 16, h: 9 });
  assert.deepEqual(parseRatio('16：9'), { w: 16, h: 9 });
  assert.deepEqual(parseRatio('1.91:1'), { w: 1.91, h: 1 });
  assert.deepEqual(parseRatio('2.35'), { w: 2.35, h: 1 });
  assert.equal(parseRatio('a:b'), null);
  assert.equal(parseRatio('0:1'), null);
  assert.equal(parseRatio('1:2:3'), null);
  assert.equal(parseRatio(''), null);
});

test('solve the missing side, rounded', () => {
  assert.deepEqual(solveSide({ w: 16, h: 9 }, { width: 1280 }), { width: 1280, height: 720, exact: true });
  assert.deepEqual(solveSide({ w: 4, h: 5 }, { height: 1350 }), { width: 1080, height: 1350, exact: true });
  assert.deepEqual(solveSide({ w: 1.91, h: 1 }, { width: 1080 }), { width: 1080, height: 565, exact: false });
  assert.deepEqual(solveSide({ w: 16, h: 9 }, { width: 1000 }), { width: 1000, height: 563, exact: false });
  assert.equal(solveSide({ w: 16, h: 9 }, {}), null);
  assert.equal(solveSide(null, { width: 10 }), null);
});

test('social sizes and chips are consistent with the ratio list', () => {
  const ids = new Set(COMMON_RATIOS.map((r) => r.id));
  for (const c of RATIO_CHIPS) assert.ok(ids.has(c), c);
  assert.equal(new Set(SOCIAL_SIZES.map((s) => s.id)).size, SOCIAL_SIZES.length);
  for (const s of SOCIAL_SIZES) {
    const n = nearestRatio(s.w / s.h)!;
    assert.equal(n.id, s.ratio, `${s.id} ${s.w}×${s.h}`);
    assert.ok(n.exact, s.id);
  }
});
