/**
 * Unicode "fonts": look-alike characters from the Mathematical Alphanumeric Symbols block and a few
 * others. Pure functions, shared by the tool widgets and the tests.
 */

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';

/** Letters missing from the math blocks live in Letterlike Symbols instead. */
const HOLES = {
  italic: { h: 'ℎ' },
  script: { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' },
  fraktur: { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' },
  doubleStruck: { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' },
};

/** Builds a map from a math-block start (capital A) and optional digit start (zero). */
function mathMap(upperStart, digitStart, holes = {}) {
  const m = {};
  for (let i = 0; i < 26; i++) {
    m[UPPER[i]] = holes[UPPER[i]] || String.fromCodePoint(upperStart + i);
    m[LOWER[i]] = holes[LOWER[i]] || String.fromCodePoint(upperStart + 26 + i);
  }
  if (digitStart) for (let d = 0; d < 10; d++) m[String(d)] = String.fromCodePoint(digitStart + d);
  return m;
}

function listMap(upper, lower, digits) {
  const m = {};
  const u = Array.from(upper);
  const l = Array.from(lower || upper);
  for (let i = 0; i < 26; i++) {
    m[UPPER[i]] = u[i];
    m[LOWER[i]] = l[i];
  }
  if (digits) Array.from(digits).forEach((c, d) => (m[String(d)] = c));
  return m;
}

function circled() {
  const m = {};
  for (let i = 0; i < 26; i++) {
    m[UPPER[i]] = String.fromCodePoint(0x24b6 + i);
    m[LOWER[i]] = String.fromCodePoint(0x24d0 + i);
  }
  m['0'] = '⓪';
  for (let d = 1; d < 10; d++) m[String(d)] = String.fromCodePoint(0x2460 + d - 1);
  return m;
}

function upperOnly(start, digits) {
  const m = {};
  for (let i = 0; i < 26; i++) m[UPPER[i]] = m[LOWER[i]] = String.fromCodePoint(start + i);
  if (digits) Array.from(digits).forEach((c, d) => (m[String(d)] = c));
  return m;
}

function fullwidth() {
  const m = { ' ': '　' };
  for (let c = 0x21; c <= 0x7e; c++) m[String.fromCharCode(c)] = String.fromCodePoint(c + 0xfee0);
  return m;
}

const FLIP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ',
  n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
  '.': '˙', ',': "'", "'": ',', '"': '„', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[',
  '{': '}', '}': '{', '<': '>', '>': '<', _: '‾', '&': '⅋',
};

const combining = (mark) => (text) => Array.from(text).map((c) => (/\s/.test(c) ? c : c + mark)).join('');

/**
 * Every style: `id`, display `name`, and either a character `map` or a whole-string `fn`.
 * Groups decide which tool pages show which styles.
 */
export const STYLES = [
  { id: 'bold', name: 'Bold (serif)', map: mathMap(0x1d400, 0x1d7ce), groups: ['all', 'bold'] },
  { id: 'italic', name: 'Italic', map: mathMap(0x1d434, 0, HOLES.italic), groups: ['all'] },
  { id: 'boldItalic', name: 'Bold italic', map: mathMap(0x1d468), groups: ['all', 'bold'] },
  { id: 'sansBold', name: 'Bold (sans)', map: mathMap(0x1d5d4, 0x1d7ec), groups: ['all', 'bold'] },
  { id: 'sansBoldItalic', name: 'Bold italic (sans)', map: mathMap(0x1d63c), groups: ['all', 'bold'] },
  { id: 'sans', name: 'Sans-serif', map: mathMap(0x1d5a0, 0x1d7e2), groups: ['all'] },
  { id: 'sansItalic', name: 'Italic (sans)', map: mathMap(0x1d608), groups: ['all'] },
  { id: 'script', name: 'Script', map: mathMap(0x1d49c, 0, HOLES.script), groups: ['all'] },
  { id: 'boldScript', name: 'Bold script', map: mathMap(0x1d4d0), groups: ['all', 'bold'] },
  { id: 'fraktur', name: 'Gothic', map: mathMap(0x1d504, 0, HOLES.fraktur), groups: ['all'] },
  { id: 'boldFraktur', name: 'Bold gothic', map: mathMap(0x1d56c), groups: ['all', 'bold'] },
  { id: 'doubleStruck', name: 'Double-struck', map: mathMap(0x1d538, 0x1d7d8, HOLES.doubleStruck), groups: ['all', 'bold'] },
  { id: 'mono', name: 'Monospace', map: mathMap(0x1d670, 0x1d7f6), groups: ['all'] },
  { id: 'circled', name: 'Bubble', map: circled(), groups: ['all'] },
  { id: 'blackCircled', name: 'Black bubble', map: upperOnly(0x1f150, '⓿➊➋➌➍➎➏➐➑➒'), groups: ['all', 'bold'] },
  { id: 'squared', name: 'Squared', map: upperOnly(0x1f130), groups: ['all'] },
  { id: 'blackSquared', name: 'Black squared', map: upperOnly(0x1f170), groups: ['all', 'bold'] },
  { id: 'fullwidth', name: 'Wide (vaporwave)', map: fullwidth(), groups: ['all'] },
  { id: 'smallCaps', name: 'Small caps', map: listMap('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'), groups: ['all'] },
  {
    id: 'superscript',
    name: 'Tiny (superscript)',
    map: listMap('ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ', 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ', '⁰¹²³⁴⁵⁶⁷⁸⁹'),
    groups: ['all'],
  },
  {
    id: 'upsideDown',
    name: 'Upside down',
    fn: (t) => Array.from(t).reverse().map((c) => FLIP[c.toLowerCase()] ?? c).join(''),
    groups: ['all'],
  },
  { id: 'strike', name: 'Strikethrough', fn: combining('̶'), groups: ['all', 'strike'] },
  { id: 'shortStrike', name: 'Short strikethrough', fn: combining('̵'), groups: ['strike'] },
  { id: 'slash', name: 'Slash through', fn: combining('̸'), groups: ['all', 'strike'] },
  { id: 'underline', name: 'Underline', fn: combining('̲'), groups: ['all', 'strike'] },
  { id: 'doubleUnderline', name: 'Double underline', fn: combining('̳'), groups: ['strike'] },
];

/**
 * An accented letter (é, ü, ç) has no styled twin, so the base letter is styled and the accent kept
 * as a combining mark: é → 𝐞́. Letters that don't decompose (ß, ø) pass through unchanged.
 */
function accented(c, map) {
  const parts = Array.from(c.normalize('NFD'));
  if (parts.length < 2 || !map[parts[0]]) return null;
  return map[parts[0]] + parts.slice(1).join('');
}

/** Converts plain text into one style. Characters a style doesn't cover pass through unchanged. */
export function convert(text, styleId) {
  const style = STYLES.find((s) => s.id === styleId);
  if (!style) return text;
  const input = String(text ?? '');
  if (style.fn) return style.fn(input);
  return Array.from(input).map((c) => style.map[c] ?? accented(c, style.map) ?? c).join('');
}

/** The styles a tool page shows: `all` (font generators), `bold` or `strike`. */
export const stylesFor = (group) => STYLES.filter((s) => s.groups.includes(group));

/** Styled character → plain character, for every mapped style (used to restyle selected text). */
let PLAIN;
function plainMap() {
  if (PLAIN) return PLAIN;
  PLAIN = new Map();
  for (const s of STYLES) {
    if (!s.map || s.id === 'fullwidth' || s.id === 'smallCaps' || s.id === 'superscript') continue;
    for (const [plain, styled] of Object.entries(s.map)) if (styled !== plain && !PLAIN.has(styled)) PLAIN.set(styled, plain);
  }
  return PLAIN;
}

/** Undo math-alphanumeric styles and combining strike/underline marks. */
export function toPlain(text) {
  const map = plainMap();
  return Array.from(String(text ?? '').replace(/[̲-̸]/g, ''))
    .map((c) => map.get(c) ?? c)
    .join('');
}
