/**
 * Text layout helpers for the text-on-image maker (components/tools/TextImageTool.jsx).
 * No DOM access: every function takes a `measure(text, fontSize) => width` callback, so the
 * component passes canvas measureText and the tests pass a fake.
 */

/** Output sizes. 'original' (the photo's own size, capped) is added by the widget when a photo is loaded. */
export const TEXT_IMAGE_SIZES = [
  { id: '1:1', w: 1080, h: 1080 },
  { id: '4:5', w: 1080, h: 1350 },
  { id: '9:16', w: 1080, h: 1920 },
  { id: '16:9', w: 1920, h: 1080 },
];

/** Longest side for the 'original' size: keeps big phone photos well under the iOS canvas limit. */
export const ORIGINAL_MAX = 2160;

/** The photo's own size, scaled down so the long side is at most `max`. */
export function originalSize(w, h, max = ORIGINAL_MAX) {
  const k = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

// Characters that may break anywhere (CJK ideographs, kana, Hangul, full-width forms).
const CJK = /[⺀-⿿　-〿぀-ヿ㄀-ㇿ㐀-䶿一-鿿가-힯豈-﫿︰-﹏＀-￯]/;
// Japanese line-breaking rules (kinsoku): these never start a line…
const NO_START = new Set(Array.from('、。，．,.!?！？：；:;）)］]｝}〕〉》」』】〙〗’”ー…‥・ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々〻ゝゞヽヾ%％'));
// …and these never end one.
const NO_END = new Set(Array.from('（(［[｛{〔〈《「『【〘〖‘“'));

function graphemes(str) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(str), (x) => x.segment);
  }
  return Array.from(str);
}

/** Splits a paragraph into break opportunities: words, runs of spaces, and single CJK characters. */
export function tokenize(paragraph) {
  const tokens = [];
  let word = '';
  let space = '';
  const flushWord = () => word && (tokens.push(word), (word = ''));
  const flushSpace = () => space && (tokens.push(space), (space = ''));
  for (const g of graphemes(paragraph)) {
    if (/^\s+$/.test(g)) {
      flushWord();
      space += g;
    } else if (CJK.test(g)) {
      flushWord();
      flushSpace();
      tokens.push(g);
    } else {
      flushSpace();
      word += g;
    }
  }
  flushWord();
  flushSpace();
  return tokens;
}

const isSpace = (t) => /^\s+$/.test(t);
const firstChar = (t) => graphemes(t)[0] || '';
const lastChar = (t) => graphemes(t).slice(-1)[0] || '';

/**
 * Wraps text to `maxWidth` at `fontSize`. Explicit newlines are kept (an empty line stays an empty
 * line); Latin text breaks between words, CJK text between characters, following basic kinsoku
 * rules (closing punctuation hangs on the line before; opening brackets move to the next line).
 * Words longer than the line are split by character.
 */
export function wrapText(text, maxWidth, fontSize, measure) {
  const fits = (str) => measure(str, fontSize) <= maxWidth;
  const out = [];
  for (const paragraph of String(text).replace(/\r\n?/g, '\n').split('\n')) {
    const lines = [];
    let line = '';
    const push = () => {
      lines.push(line.replace(/\s+$/, ''));
      line = '';
    };
    const pieces = [];
    for (const tok of tokenize(paragraph)) {
      // A token wider than the whole line is broken into characters.
      if (!isSpace(tok) && !fits(tok) && graphemes(tok).length > 1) pieces.push(...graphemes(tok));
      else pieces.push(tok);
    }
    for (const tok of pieces) {
      if (line === '' && isSpace(tok) && lines.length) continue; // no leading spaces on wrapped lines
      if (line === '' || fits(line + tok)) {
        line += tok;
        continue;
      }
      if (isSpace(tok)) {
        push();
        continue;
      }
      if (NO_START.has(firstChar(tok))) {
        line += tok; // hanging punctuation: let it overflow a little rather than start a line
        continue;
      }
      let carry = '';
      const trimmed = line.replace(/\s+$/, '');
      const last = lastChar(trimmed);
      if (NO_END.has(last) && graphemes(trimmed).length > 1) {
        carry = last;
        line = trimmed.slice(0, trimmed.length - last.length);
      }
      push();
      line = carry + tok;
    }
    push();
    out.push(...lines);
  }
  return out;
}

/**
 * Lays text out in a box: wraps at `fontSize`, and if the block is taller than `maxHeight` (or a
 * line still overflows), steps the size down until it fits or reaches `minFontSize`.
 * Returns { lines, fontSize, lineHeight (px), width (widest line), height, shrunk }.
 */
export function fitText(text, { maxWidth, maxHeight = Infinity, fontSize, minFontSize = 12, lineHeight = 1.25 }, measure) {
  let size = Math.max(minFontSize, Math.round(fontSize));
  for (;;) {
    const lines = wrapText(text, maxWidth, size, measure);
    const width = Math.max(0, ...lines.map((l) => measure(l, size)));
    const lh = size * lineHeight;
    const height = lines.length * lh;
    if ((height <= maxHeight && width <= maxWidth * 1.08) || size <= minFontSize) {
      return { lines, fontSize: size, lineHeight: lh, width, height, shrunk: size < Math.round(fontSize) };
    }
    size = Math.max(minFontSize, Math.floor(size * 0.94));
  }
}

/** Top of a block of `blockH` pixels placed at 'top' | 'middle' | 'bottom' of a canvas `canvasH` high, `margin` from the edge. */
export function blockTop(position, canvasH, blockH, margin) {
  if (position === 'top') return margin;
  if (position === 'bottom') return canvasH - margin - blockH;
  return (canvasH - blockH) / 2;
}

/** The x a line is drawn at for canvas textAlign 'left' | 'center' | 'right' inside [left, left + width]. */
export function alignX(align, left, width) {
  if (align === 'right') return left + width;
  if (align === 'center') return left + width / 2;
  return left;
}

/** Relative luminance (0–1) of a #rrggbb colour, to pick a contrasting band or outline. */
export function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** Black or white, whichever stands out against `hex`. */
export const contrastColor = (hex) => (luminance(hex) > 0.4 ? '#000000' : '#ffffff');
