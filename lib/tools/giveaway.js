/**
 * Giveaway draws: parse a pasted list of entrants, then pick winners and alternates without
 * replacement. Pure functions, no DOM. Randomness comes from crypto.getRandomValues by default;
 * every picker takes an injectable `rng(max) → integer in [0, max)` so tests can be exact.
 */

export const MAX_WINNERS = 20;
export const MAX_ALTERNATES = 5;
export const MAX_ENTRIES = 20000;

/** A fair integer in [0, max) from the Web Crypto API (rejection sampling, no modulo bias). */
export function cryptoRandomInt(max) {
  if (!(max > 0)) return 0;
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    globalThis.crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

/** Case-insensitive key for a name: full-width letters folded (NFKC) and lower-cased. */
export const nameKey = (name) => name.normalize('NFKC').toLowerCase();

/** Splits pasted text into names: one per line or separated by commas; trims and drops a leading @. */
export function splitNames(text, { firstWord = false } = {}) {
  // `firstWord`: pasted comments ("@maya love this! 😍") → one line per comment, keep only the username.
  const lines = String(text || '').split(firstWord ? /[\n\r]+/ : /[\n\r,，、]+/);
  return lines
    .map((x) => x.trim().replace(/^[@＠]+/, '').trim())
    .map((x) => (firstWord ? x.split(/[\s,，、:：]+/)[0].replace(/^[@＠]+/, '') : x))
    .filter(Boolean)
    .slice(0, MAX_ENTRIES);
}

/**
 * Parses entrants into a draw pool.
 * - dedupe (default true): one place per person, names matched case-insensitively. With `weight`,
 *   a person who appears several times gets that many chances (but can still win only once).
 * - dedupe false: every line is its own entry, so a repeated name can win more than one place.
 * - exclude: names (text or array) left out of the draw, e.g. your own account.
 * - firstWord: one entry per line, keeping only its first word (for pasted comments).
 * Returns { pool: [{ name, weight }], lines, unique, duplicates, excluded }.
 * @param {string} text
 * @param {{ dedupe?: boolean, weight?: boolean, exclude?: string | string[], firstWord?: boolean }} [options]
 */
export function parseEntries(text, { dedupe = true, weight = false, exclude = '', firstWord = false } = {}) {
  const names = splitNames(text, { firstWord });
  const banned = new Set((Array.isArray(exclude) ? exclude : splitNames(exclude)).map((n) => nameKey(String(n).replace(/^[@＠]+/, '').trim())));
  let excluded = 0;
  const kept = names.filter((n) => (banned.has(nameKey(n)) ? (excluded++, false) : true));
  const groups = new Map();
  for (const n of kept) {
    const k = nameKey(n);
    const g = groups.get(k);
    if (g) g.count++;
    else groups.set(k, { name: n, count: 1 });
  }
  const pool = dedupe ? [...groups.values()].map((g) => ({ name: g.name, weight: weight ? g.count : 1 })) : kept.map((name) => ({ name, weight: 1 }));
  return { pool, lines: names.length, unique: groups.size, duplicates: kept.length - groups.size, excluded };
}

/** Index of one weighted pick from `pool` ([{ weight }]). */
export function pickIndex(pool, rng = cryptoRandomInt) {
  const total = pool.reduce((n, e) => n + e.weight, 0);
  let r = rng(total);
  for (let i = 0; i < pool.length; i++) {
    r -= pool[i].weight;
    if (r < 0) return i;
  }
  return pool.length - 1;
}

/**
 * Draws `winners` then `alternates` from the pool without replacement.
 * Returns { winners: [name], alternates: [name] }; short lists if there are not enough entrants.
 */
export function drawWinners(pool, { winners = 1, alternates = 0 } = {}, rng = cryptoRandomInt) {
  const left = pool.filter((e) => e.weight > 0);
  const want = Math.min(left.length, Math.max(0, winners) + Math.max(0, alternates));
  const picked = [];
  while (picked.length < want) {
    const i = pickIndex(left, rng);
    picked.push(left[i].name);
    left.splice(i, 1);
  }
  const w = Math.min(picked.length, Math.max(0, winners));
  return { winners: picked.slice(0, w), alternates: picked.slice(w) };
}

/** Plain-text summary for "Copy results". */
export function resultsText({ winners, alternates }, { when, entrants, winnersLabel = 'Winners', alternatesLabel = 'Alternates', header = '' }) {
  const lines = [];
  if (header) lines.push(header);
  if (when) lines.push(when);
  if (entrants) lines.push(entrants);
  lines.push('', `${winnersLabel}:`, ...winners.map((n, i) => `${i + 1}. @${n}`));
  if (alternates.length) lines.push('', `${alternatesLabel}:`, ...alternates.map((n, i) => `${i + 1}. @${n}`));
  return lines.join('\n');
}
