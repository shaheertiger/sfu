/**
 * Pure helpers for the blur / pixelate tool: rectangle maths, export sizing and the mosaic
 * itself. No DOM access: `pixelate` works on any ImageData-like { data, width, height }.
 */

/** Largest canvas the export draws: iPhones refuse canvases above about 16.7 megapixels. */
export const MAX_PIXELS = 16_000_000;

/** Two drag points (any order) → { x, y, w, h } with positive width and height. */
export function normalizeRect(x0, y0, x1, y1) {
  return { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
}

/** Clips a rect to a W×H image and snaps it to whole pixels. Returns null when nothing is left. */
export function clampRect(r, W, H) {
  const x0 = Math.max(0, Math.floor(r.x));
  const y0 = Math.max(0, Math.floor(r.y));
  const x1 = Math.min(W, Math.ceil(r.x + r.w));
  const y1 = Math.min(H, Math.ceil(r.y + r.h));
  if (x1 <= x0 || y1 <= y0) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function scaleRect(r, k) {
  return { x: r.x * k, y: r.y * k, w: r.w * k, h: r.h * k };
}

/**
 * The export size for a w×h image so it stays under `max` pixels:
 * { width, height, scale, downscaled }. Never enlarges.
 */
export function fitPixels(w, h, max = MAX_PIXELS) {
  const scale = w * h > max ? Math.sqrt(max / (w * h)) : 1;
  const width = Math.max(1, Math.floor(w * scale));
  const height = Math.max(1, Math.floor(h * scale));
  return { width, height, scale: width / w, downscaled: scale < 1 };
}

/**
 * Effect strength is set per 1000 pixels of the image's long side, so the preview (drawn
 * smaller) looks like the full-size export. strengthPx(12, 4000) → 48.
 */
export function strengthPx(level, longSide, min = 1) {
  return Math.max(min, Math.round((level * longSide) / 1000));
}

/**
 * Mosaic: replaces every block×block cell inside `rect` (default: the whole image) with the
 * cell's average colour. Blocks start at the rect's top-left corner; edge cells are smaller.
 * Colours are averaged weighted by alpha, so transparent pixels don't darken the result.
 * Mutates `img.data` in place and returns `img`.
 */
export function pixelate(img, block, rect = { x: 0, y: 0, w: img.width, h: img.height }) {
  const { data, width } = img;
  const r = clampRect(rect, img.width, img.height);
  const b = Math.max(1, Math.round(block));
  if (!r || b <= 1) return img;
  for (let by = r.y; by < r.y + r.h; by += b) {
    const yEnd = Math.min(by + b, r.y + r.h);
    for (let bx = r.x; bx < r.x + r.w; bx += b) {
      const xEnd = Math.min(bx + b, r.x + r.w);
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let sa = 0;
      let n = 0;
      for (let y = by; y < yEnd; y++) {
        let i = (y * width + bx) * 4;
        for (let x = bx; x < xEnd; x++, i += 4) {
          const a = data[i + 3];
          sr += data[i] * a;
          sg += data[i + 1] * a;
          sb += data[i + 2] * a;
          sa += a;
          n++;
        }
      }
      const R = sa ? Math.round(sr / sa) : 0;
      const G = sa ? Math.round(sg / sa) : 0;
      const B = sa ? Math.round(sb / sa) : 0;
      const A = Math.round(sa / n);
      for (let y = by; y < yEnd; y++) {
        let i = (y * width + bx) * 4;
        for (let x = bx; x < xEnd; x++, i += 4) {
          data[i] = R;
          data[i + 1] = G;
          data[i + 2] = B;
          data[i + 3] = A;
        }
      }
    }
  }
  return img;
}

/**
 * Splits a rect into horizontal strips of whole blocks, each at most about `maxPixels`, so a
 * full-size mosaic never needs one huge getImageData. Strips keep the block grid of the rect.
 */
export function blockStrips(rect, block, maxPixels = 2_000_000) {
  const b = Math.max(1, Math.round(block));
  const rowsPerStrip = Math.max(1, Math.floor(maxPixels / Math.max(1, rect.w) / b)) * b;
  const strips = [];
  for (let y = rect.y; y < rect.y + rect.h; y += rowsPerStrip) {
    strips.push({ x: rect.x, y, w: rect.w, h: Math.min(rowsPerStrip, rect.y + rect.h - y) });
  }
  return strips;
}
