import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PIXELS, blockStrips, clampRect, fitPixels, normalizeRect, pixelate, scaleRect, strengthPx } from '../lib/tools/blur.js';

function image(width: number, height: number, fill: (x: number, y: number) => number[]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set(fill(x, y), (y * width + x) * 4);
  return { data, width, height };
}
const px = (img: { data: Uint8ClampedArray; width: number }, x: number, y: number) => Array.from(img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));

test('rectangles: normalise a drag in any direction, clamp to the image, scale', () => {
  assert.deepEqual(normalizeRect(50, 40, 10, 20), { x: 10, y: 20, w: 40, h: 20 });
  assert.deepEqual(clampRect({ x: -5, y: 2.4, w: 20, h: 100 }, 10, 50), { x: 0, y: 2, w: 10, h: 48 });
  assert.equal(clampRect({ x: 20, y: 0, w: 5, h: 5 }, 10, 10), null);
  assert.equal(clampRect({ x: 2, y: 2, w: 0, h: 5 }, 10, 10), null);
  assert.deepEqual(scaleRect({ x: 10, y: 20, w: 30, h: 40 }, 0.5), { x: 5, y: 10, w: 15, h: 20 });
});

test('export size stays under 16 megapixels', () => {
  assert.deepEqual(fitPixels(4000, 3000), { width: 4000, height: 3000, scale: 1, downscaled: false });
  const big = fitPixels(8064, 6048);
  assert.ok(big.width * big.height <= MAX_PIXELS);
  assert.equal(big.downscaled, true);
  assert.ok(Math.abs(big.width / big.height - 8064 / 6048) < 0.001);
  assert.equal(strengthPx(12, 4000), 48);
  assert.equal(strengthPx(1, 100, 2), 2);
});

test('pixelate averages each block and leaves the rest alone', () => {
  // A 4×2 image: left half black/white checker, right half red.
  const img = image(4, 2, (x, y) => (x < 2 ? ((x + y) % 2 ? [255, 255, 255, 255] : [0, 0, 0, 255]) : [255, 0, 0, 255]));
  pixelate(img, 2, { x: 0, y: 0, w: 2, h: 2 });
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) assert.deepEqual(px(img, x, y), [128, 128, 128, 255]);
  assert.deepEqual(px(img, 2, 0), [255, 0, 0, 255]);
  assert.deepEqual(px(img, 3, 1), [255, 0, 0, 255]);
});

test('pixelate: blocks start at the rect, edge blocks are partial, alpha is weighted', () => {
  const img = image(5, 1, (x) => [x * 50, 0, 0, 255]);
  pixelate(img, 2, { x: 1, y: 0, w: 4, h: 1 });
  assert.deepEqual(px(img, 0, 0), [0, 0, 0, 255]);
  assert.deepEqual(px(img, 1, 0), [75, 0, 0, 255]);
  assert.deepEqual(px(img, 2, 0), [75, 0, 0, 255]);
  assert.deepEqual(px(img, 3, 0), [175, 0, 0, 255]);
  const alpha = image(2, 1, (x) => (x ? [200, 100, 50, 255] : [0, 0, 0, 0]));
  pixelate(alpha, 4);
  assert.deepEqual(px(alpha, 0, 0), [200, 100, 50, 128]);
  // A rect partly outside the image is clipped, block size 1 is a no-op.
  const same = image(3, 3, (x, y) => [x, y, 0, 255]);
  const before = Array.from(same.data);
  pixelate(same, 1);
  assert.deepEqual(Array.from(same.data), before);
  pixelate(same, 8, { x: 2, y: 2, w: 10, h: 10 });
  assert.deepEqual(px(same, 2, 2), [2, 2, 0, 255]);
  assert.deepEqual(px(same, 0, 0), [0, 0, 0, 255]);
});

test('strips keep the block grid and cover the rect exactly', () => {
  const rect = { x: 10, y: 7, w: 1000, h: 2500 };
  const strips = blockStrips(rect, 30, 100_000);
  assert.equal(strips[0].y, 7);
  for (const s of strips.slice(0, -1)) assert.equal(s.h % 30, 0);
  assert.equal(strips.reduce((n, s) => n + s.h, 0), 2500);
  for (const s of strips) assert.ok(s.w * s.h <= 100_000 || s.h === 30);
});
