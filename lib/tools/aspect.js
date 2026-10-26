/**
 * Aspect ratio maths for the aspect ratio calculator. Pure functions, no DOM.
 */

export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

/** 1920, 1080 → [16, 9]. Whole numbers only; returns null for anything that is not a positive size. */
export function simplify(w, h) {
  if (!(w > 0) || !(h > 0)) return null;
  const W = Math.round(w);
  const H = Math.round(h);
  if (!W || !H) return null;
  const g = gcd(W, H);
  return [W / g, H / g];
}

/**
 * The ratios people actually ask for. `key` names the usual use (the widget translates it);
 * `value` is width ÷ height. 1.91:1 is the link / landscape size several networks use.
 */
export const COMMON_RATIOS = [
  { id: '1:1', w: 1, h: 1, key: 'square' },
  { id: '4:5', w: 4, h: 5, key: 'portraitFeed' },
  { id: '3:4', w: 3, h: 4, key: 'portrait' },
  { id: '2:3', w: 2, h: 3, key: 'pin' },
  { id: '9:16', w: 9, h: 16, key: 'vertical' },
  { id: '5:4', w: 5, h: 4, key: 'print' },
  { id: '4:3', w: 4, h: 3, key: 'classic' },
  { id: '3:2', w: 3, h: 2, key: 'photo' },
  { id: '16:10', w: 16, h: 10, key: 'laptop' },
  { id: '16:9', w: 16, h: 9, key: 'widescreen' },
  { id: '1.91:1', w: 1.91, h: 1, key: 'link' },
  { id: '2:1', w: 2, h: 1, key: 'banner' },
  { id: '21:9', w: 21, h: 9, key: 'ultrawide' },
  { id: '3:1', w: 3, h: 1, key: 'header' },
  { id: '4:1', w: 4, h: 1, key: 'header' },
].map((r) => ({ ...r, value: r.w / r.h }));

/** Ratios offered as chips in "calculate a size" mode. */
export const RATIO_CHIPS = ['1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '1.91:1', '4:3', '21:9'];

/**
 * The closest named ratio to `value` (width ÷ height), compared on a log scale so 1:2 and 2:1
 * are equally far from 1:1. `exact` when within 1% (1080×566 counts as 1.91:1).
 */
export function nearestRatio(value) {
  if (!(value > 0) || !Number.isFinite(value)) return null;
  let best = null;
  let bestDiff = Infinity;
  for (const r of COMMON_RATIOS) {
    const d = Math.abs(Math.log(value / r.value));
    if (d < bestDiff) {
      best = r;
      bestDiff = d;
    }
  }
  if (!best) return null;
  return { ...best, exact: bestDiff < Math.log(1.01), off: value / best.value - 1 };
}

export function orientation(w, h) {
  if (!(w > 0) || !(h > 0)) return null;
  return w === h ? 'square' : w > h ? 'landscape' : 'portrait';
}

/**
 * Everything the "find the ratio" mode shows: 1920×1080 → { ratio: [16, 9], label: '16:9',
 * decimal: 1.7778, nearest: {id: '16:9', exact: true…}, orientation: 'landscape' }.
 */
export function ratioFromSize(w, h) {
  const ratio = simplify(w, h);
  if (!ratio) return null;
  const decimal = Math.round(w) / Math.round(h);
  return {
    ratio,
    label: `${ratio[0]}:${ratio[1]}`,
    decimal,
    nearest: nearestRatio(decimal),
    orientation: orientation(Math.round(w), Math.round(h)),
    megapixels: (Math.round(w) * Math.round(h)) / 1e6,
  };
}

/** '16:9', '16/9', '16x9', '1.91:1' or a bare '1.91' → { w, h }. Null when it is not a usable ratio. */
export function parseRatio(text) {
  const t = String(text ?? '').trim().replace(/[：／×xX/]/g, ':').replace(/\s+/g, '');
  if (!t) return null;
  const parts = t.split(':');
  if (parts.length > 2) return null;
  const w = Number(parts[0]);
  const h = parts.length === 2 ? Number(parts[1]) : 1;
  if (!(w > 0) || !(h > 0) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { w, h };
}

/**
 * Fill in the missing side for a ratio: solveSide({ w: 16, h: 9 }, { width: 1280 }) → { width: 1280, height: 720 }.
 * The result is rounded to whole pixels; `exact` says whether rounding was needed.
 */
export function solveSide(ratio, { width, height } = {}) {
  if (!ratio || !(ratio.w > 0) || !(ratio.h > 0)) return null;
  if (width > 0) {
    const raw = (width * ratio.h) / ratio.w;
    return { width, height: Math.max(1, Math.round(raw)), exact: Math.abs(raw - Math.round(raw)) < 1e-9 };
  }
  if (height > 0) {
    const raw = (height * ratio.w) / ratio.h;
    return { width: Math.max(1, Math.round(raw)), height, exact: Math.abs(raw - Math.round(raw)) < 1e-9 };
  }
  return null;
}

/**
 * Recommended upload sizes, at the time of writing. `use` is a key the widget translates;
 * `ratio` is the ratio the platform names, which can differ slightly from the simplified pixels
 * (1080×566 is "1.91:1").
 */
export const SOCIAL_SIZES = [
  { id: 'ig-portrait', platform: 'Instagram', use: 'feedPortrait', w: 1080, h: 1350, ratio: '4:5' },
  { id: 'ig-square', platform: 'Instagram', use: 'feedSquare', w: 1080, h: 1080, ratio: '1:1' },
  { id: 'ig-landscape', platform: 'Instagram', use: 'feedLandscape', w: 1080, h: 566, ratio: '1.91:1' },
  { id: 'ig-stories', platform: 'Instagram', use: 'storiesReels', w: 1080, h: 1920, ratio: '9:16' },
  { id: 'tiktok', platform: 'TikTok', use: 'video', w: 1080, h: 1920, ratio: '9:16' },
  { id: 'yt-video', platform: 'YouTube', use: 'video', w: 1920, h: 1080, ratio: '16:9' },
  { id: 'yt-thumb', platform: 'YouTube', use: 'thumbnail', w: 1280, h: 720, ratio: '16:9' },
  { id: 'yt-shorts', platform: 'YouTube', use: 'shorts', w: 1080, h: 1920, ratio: '9:16' },
  { id: 'x-image', platform: 'X', use: 'image', w: 1600, h: 900, ratio: '16:9' },
  { id: 'li-post', platform: 'LinkedIn', use: 'post', w: 1200, h: 627, ratio: '1.91:1' },
  { id: 'li-square', platform: 'LinkedIn', use: 'postSquare', w: 1080, h: 1080, ratio: '1:1' },
  { id: 'fb-portrait', platform: 'Facebook', use: 'postPortrait', w: 1080, h: 1350, ratio: '4:5' },
  { id: 'fb-landscape', platform: 'Facebook', use: 'postLandscape', w: 1200, h: 630, ratio: '1.91:1' },
  { id: 'pinterest', platform: 'Pinterest', use: 'pin', w: 1000, h: 1500, ratio: '2:3' },
  { id: 'threads', platform: 'Threads', use: 'post', w: 1080, h: 1350, ratio: '4:5' },
];
