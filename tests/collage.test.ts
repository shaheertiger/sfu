import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLLAGE_LAYOUTS, COLLAGE_SHAPES, cellAt, collageCells, coverRect, layoutsFor, moveItem, panBy } from '../lib/tools/collage.js';

test('every layout has as many cells as photos, inside the canvas and not overlapping', () => {
  for (const shape of COLLAGE_SHAPES) {
    for (const l of COLLAGE_LAYOUTS) {
      const cells = collageCells(l.id, shape.w, shape.h, 12, 20);
      assert.equal(cells.length, l.n, l.id);
      for (const c of cells) {
        assert.ok(c.x >= 20 && c.y >= 20 && c.w > 0 && c.h > 0, `${l.id} ${JSON.stringify(c)}`);
        assert.ok(c.x + c.w <= shape.w - 20 && c.y + c.h <= shape.h - 20, `${l.id} ${JSON.stringify(c)}`);
        assert.ok(Number.isInteger(c.x) && Number.isInteger(c.w));
      }
      for (let i = 0; i < cells.length; i++)
        for (let j = i + 1; j < cells.length; j++) {
          const a = cells[i], b = cells[j];
          const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
          assert.ok(!overlap, `${l.id} cells ${i} and ${j} overlap`);
        }
    }
  }
});

test('gap and padding: two side by side on 1080×1080', () => {
  const [a, b] = collageCells('2-side', 1080, 1080, 10, 20);
  assert.deepEqual(a, { x: 20, y: 20, w: 515, h: 1040 });
  assert.deepEqual(b, { x: 545, y: 20, w: 515, h: 1040 });
  assert.equal(b.x - (a.x + a.w), 10);
  const [full] = collageCells('2-stack', 1080, 1350, 0, 0);
  assert.deepEqual(full, { x: 0, y: 0, w: 1080, h: 675 });
});

test('spanning cells line up with the gaps of their neighbours', () => {
  const big = collageCells('4-top', 1080, 1350, 12, 0);
  assert.equal(big[0].x, 0);
  assert.equal(big[0].w, 1080);
  assert.ok(big[0].h > big[1].h, 'top photo is bigger');
  assert.equal(big[1].y - (big[0].y + big[0].h), 12);
  assert.equal(big[3].x + big[3].w, 1080);
  const left = collageCells('3-left', 1080, 1080, 8, 0);
  assert.equal(left[0].h, 1080);
  assert.equal(left[2].y + left[2].h, 1080);
  const five = collageCells('5', 1080, 1080, 6, 0);
  assert.equal(five[1].x + five[1].w, 1080);
  assert.equal(five[4].x + five[4].w, 1080);
});

test('huge gaps and padding never produce negative cells', () => {
  for (const l of COLLAGE_LAYOUTS) for (const c of collageCells(l.id, 100, 100, 400, 400)) assert.ok(c.w >= 0 && c.h >= 0);
});

test('layout filter matches the photo count, or shows all', () => {
  assert.deepEqual(layoutsFor(2).map((l) => l.id), ['2-side', '2-stack']);
  assert.deepEqual(layoutsFor(4).map((l) => l.id), ['4-grid', '4-top']);
  assert.equal(layoutsFor(9).length, 1);
  assert.equal(layoutsFor(0).length, COLLAGE_LAYOUTS.length);
});

test('cover fit fills the cell and pans within the overflow', () => {
  const r = coverRect(4000, 3000, 500, 500);
  assert.equal(r.dh, 500);
  assert.ok(Math.abs(r.dw - 666.67) < 0.01);
  assert.ok(Math.abs(r.dx + r.ox / 2) < 1e-9);
  assert.equal(r.dy, 0);
  const left = coverRect(4000, 3000, 500, 500, 0, 0.5);
  assert.equal(left.dx, 0);
  const right = coverRect(4000, 3000, 500, 500, 1, 0.5);
  assert.ok(Math.abs(right.dx + right.dw - 500) < 1e-9);
  // Dragging right by the full overflow moves to the left edge; vertical has no overflow.
  assert.deepEqual(panBy({ x: 0.5, y: 0.5 }, r.ox, 50, r), { x: 0, y: 0.5 });
  assert.deepEqual(panBy({ x: 0.5, y: 0.5 }, -9999, 0, r), { x: 1, y: 0.5 });
});

test('hit testing and reordering', () => {
  const cells = collageCells('2-side', 1080, 1080, 20, 0);
  assert.equal(cellAt(cells, 10, 10), 0);
  assert.equal(cellAt(cells, 1070, 500), 1);
  assert.equal(cellAt(cells, 540, 500), -1); // in the gap
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c']);
  assert.deepEqual(moveItem(['a', 'b', 'c'], 2, -1), ['a', 'c', 'b']);
  assert.deepEqual(moveItem(['a', 'b'], 0, -1), ['a', 'b']);
});
