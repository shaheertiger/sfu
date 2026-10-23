/**
 * Character counting the way the platforms do it. Pure functions, shared by the widgets and tests.
 */

/** X counts these code points as 1; everything else (CJK, most symbols) as 2. */
const LIGHT = [
  [0x0000, 0x10ff],
  [0x2000, 0x200d],
  [0x2010, 0x201f],
  [0x2032, 0x2037],
];
const isLight = (cp) => LIGHT.some(([a, b]) => cp >= a && cp <= b);

/** Links X shortens to t.co: explicit http(s) links, www. links and bare domains with a path or common TLD. */
const URL_RE = /\b(?:https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|co|app|dev|ai|me|ly|gg|tv|xyz|info|biz|us|uk|ca|de)\b(?:\/[^\s]*)?)/gi;
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

export const X_URL_LENGTH = 23;
export const X_LIMITS = { standard: 280, premium: 25000, bio: 160, name: 50 };

function graphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Weighted length of a post on X: links count 23, emoji 2, CJK and most symbols 2, Latin 1. */
export function xLength(text) {
  const input = String(text ?? '').normalize('NFC');
  let urls = 0;
  const rest = input.replace(URL_RE, () => {
    urls++;
    return '';
  });
  let total = urls * X_URL_LENGTH;
  for (const g of graphemes(rest)) {
    if (EMOJI_RE.test(g)) {
      total += 2;
      continue;
    }
    for (const ch of g) total += isLight(ch.codePointAt(0)) ? 1 : 2;
  }
  return { length: total, urls };
}

/** Plain length as most platforms show it: one per character (code point), line breaks included. */
export const plainLength = (text) => Array.from(String(text ?? '')).length;

export function stats(text) {
  const t = String(text ?? '');
  const trimmed = t.trim();
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: t ? t.split('\n').length : 0,
    characters: plainLength(t),
  };
}

export const DISCORD_LIMITS = [
  { id: 'message', label: 'Message', limit: 2000 },
  { id: 'nitro', label: 'Message with Nitro', limit: 4000 },
  { id: 'about', label: 'About Me', limit: 190 },
  { id: 'status', label: 'Custom status', limit: 128 },
  { id: 'display', label: 'Display name', limit: 32 },
];

/**
 * Instagram drops empty lines and trailing spaces from captions and bios. Putting an invisible
 * character (U+2800 BRAILLE PATTERN BLANK) on each empty line keeps the spacing.
 */
export const BLANK = '⠀';
export function instagramLineBreaks(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t ]+$/, ''))
    .map((line) => (line.trim() === '' ? BLANK : line))
    .join('\n')
    .replace(new RegExp(`^(?:${BLANK}\\n)+|(?:\\n${BLANK})+$`, 'g'), '');
}
