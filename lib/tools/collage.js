/**
 * Layout maths for the photo collage maker (components/tools/CollageTool.jsx). No DOM access.
 *
 * A layout is a grid of weighted tracks plus cells that span them, so every layout (2 side by
 * side up to a 3×3 grid) goes through the same gap and padding arithmetic.
 */

/** Output sizes. 4:5 and 3:4 are the portrait feed sizes; 9:16 is Stories and Reels. */
export const COLLAGE_SHAPES = [
  { id: '1:1', w: 1080, h: 1080 },
  { id: '4:5', w: 1080, h: 1350 },
  { id: '3:4', w: 1080, h: 1440 },
  { id: '9:16', w: 1080, h: 1920 },
  { id: '16:9', w: 1920, h: 1080 },
];

/**
 * cols / rows are track weights; cells are [col, row, colSpan, rowSpan], in fill order.
 * `n` is how many photos the layout holds.
 */
export const COLLAGE_LAYOUTS = [
  { id: '2-side', n: 2, cols: [1, 1], rows: [1], cells: [[0, 0, 1, 1], [1, 0, 1, 1]] },
  { id: '2-stack', n: 2, cols: [1], rows: [1, 1], cells: [[0, 0, 1, 1], [0, 1, 1, 1]] },
  { id: '3-left', n: 3, cols: [3, 2], rows: [1, 1], cells: [[0, 0, 1, 2], [1, 0, 1, 1], [1, 1, 1, 1]] },
  { id: '3-cols', n: 3, cols: [1, 1, 1], rows: [1], cells: [[0, 0, 1, 1], [1, 0, 1, 1], [2, 0, 1, 1]] },
  { id: '4-grid', n: 4, cols: [1, 1], rows: [1, 1], cells: [[0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1]] },
  { id: '4-top', n: 4, cols: [1, 1, 1], rows: [2, 1], cells: [[0, 0, 3, 1], [0, 1, 1, 1], [1, 1, 1, 1], [2, 1, 1, 1]] },
  // 2 on top, 3 below: six equal columns, the top cells span three, the bottom ones two.
  { id: '5', n: 5, cols: [1, 1, 1, 1, 1, 1], rows: [1, 1], cells: [[0, 0, 3, 1], [3, 0, 3, 1], [0, 1, 2, 1], [2, 1, 2, 1], [4, 1, 2, 1]] },
  { id: '6', n: 6, cols: [1, 1, 1], rows: [1, 1], cells: grid(3, 2) },
  // 3 on top, 4 below (twelve columns: spans of four and three).
  { id: '7', n: 7, cols: Array(12).fill(1), rows: [1, 1], cells: [[0, 0, 4, 1], [4, 0, 4, 1], [8, 0, 4, 1], [0, 1, 3, 1], [3, 1, 3, 1], [6, 1, 3, 1], [9, 1, 3, 1]] },
  { id: '8', n: 8, cols: [1, 1, 1, 1], rows: [1, 1], cells: grid(4, 2) },
  { id: '9', n: 9, cols: [1, 1, 1], rows: [1, 1, 1], cells: grid(3, 3) },
];

function grid(cols, rows) {
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r, 1, 1]);
  return cells;
}

export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 9;

export const layoutById = (id) => COLLAGE_LAYOUTS.find((l) => l.id === id) || COLLAGE_LAYOUTS[0];

/** Layouts that hold exactly `count` photos (all of them when none do). */
export function layoutsFor(count) {
  const exact = COLLAGE_LAYOUTS.filter((l) => l.n === count);
  return exact.length ? exact : COLLAGE_LAYOUTS;
}

/**
 * Edges of weighted tracks: `start` is where the first track begins, `size` the space for all
 * tracks and gaps. Returns n+1 boundaries per side as [start, end] pairs, rounded to whole pixels
 * so neighbouring cells meet exactly one gap apart.
 */
function tracks(weights, start, size, gap) {
  const n = weights.length;
  const g = n > 1 ? Math.max(0, Math.min(gap, size / (n - 1) / 2)) : 0; // never let gaps eat the cells
  const inner = Math.max(0, size - g * (n - 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const out = [];
  let pos = start;
  for (let i = 0; i < n; i++) {
    const len = (inner * weights[i]) / total;
    out.push([pos, pos + len]);
    pos += len + g;
  }
  return out;
}

/**
 * Cell rectangles {x, y, w, h} (canvas pixels, integers) for a layout on a width×height canvas,
 * with `gap` between cells and `padding` around the outside.
 */
export function collageCells(layoutId, width, height, gap = 0, padding = 0) {
  const layout = typeof layoutId === 'string' ? layoutById(layoutId) : layoutId;
  const pad = Math.max(0, Math.min(padding, width / 2 - 1, height / 2 - 1));
  const xs = tracks(layout.cols, pad, width - 2 * pad, gap);
  const ys = tracks(layout.rows, pad, height - 2 * pad, gap);
  return layout.cells.map(([c, r, cs, rs]) => {
    const x0 = Math.round(xs[c][0]);
    const x1 = Math.round(xs[c + cs - 1][1]);
    const y0 = Math.round(ys[r][0]);
    const y1 = Math.round(ys[r + rs - 1][1]);
    return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
  });
}

/**
 * Cover-fit an imgW×imgH photo into a cellW×cellH cell. `fx`/`fy` (0–1) pick which part of the
 * overflow shows (0.5 = centred). Returns the draw rectangle relative to the cell's top-left,
 * plus the overflow in each direction (how far a drag can move the photo).
 */
export function coverRect(imgW, imgH, cellW, cellH, fx = 0.5, fy = 0.5) {
  const scale = Math.max(cellW / imgW, cellH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const ox = dw - cellW;
  const oy = dh - cellH;
  // `+ 0` turns -0 into 0.
  return { dx: ox > 0 ? -ox * clamp01(fx) + 0 : 0, dy: oy > 0 ? -oy * clamp01(fy) + 0 : 0, dw, dh, ox, oy };
}

/** New pan position after dragging by (dx, dy) canvas pixels inside a cell. */
export function panBy(pos, dx, dy, overflow) {
  return {
    x: overflow.ox > 0.5 ? clamp01(pos.x - dx / overflow.ox) : 0.5,
    y: overflow.oy > 0.5 ? clamp01(pos.y - dy / overflow.oy) : 0.5,
  };
}

/** Index of the cell containing point (x, y), or -1 (in a gap or the padding). */
export function cellAt(cells, x, y) {
  return cells.findIndex((c) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h);
}

/** Moves item `from` one place left (-1) or right (+1); returns a new array. */
export function moveItem(list, from, dir) {
  const to = from + dir;
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list.slice();
  const out = list.slice();
  [out[from], out[to]] = [out[to], out[from]];
  return out;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0.5));
}
