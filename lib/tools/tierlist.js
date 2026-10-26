/**
 * Tier list state: tiers (label, colour, items), an unranked pool and a title. Pure functions that
 * return a new state and never touch the DOM, so the widget can keep the state in React and in
 * localStorage, and tests can check every move.
 *
 * state = { title, seq, tiers: [{ id, label, color, items: [item] }], pool: [item] }
 * item  = { id, type: 'text', text } | { id, type: 'image', src (data:image URL), text? }
 */

/** @typedef {{ id: string, type: 'text' | 'image', text: string, src?: string }} TierItem */
/** @typedef {{ id: string, label: string, color: string, items: TierItem[] }} Tier */
/** @typedef {{ title: string, seq: number, tiers: Tier[], pool: TierItem[] }} TierState */

export const POOL = 'pool';
export const MAX_ITEMS = 300;
export const MAX_TIERS = 12;
export const MAX_TEXT = 60;

/** The classic tier colours, S at the top. */
export const DEFAULT_TIERS = [
  { label: 'S', color: '#ff7f7f' },
  { label: 'A', color: '#ffbf7f' },
  { label: 'B', color: '#ffdf7f' },
  { label: 'C', color: '#ffff7f' },
  { label: 'D', color: '#bfff7f' },
];
/** Colours for tiers added later, in order. */
export const EXTRA_COLORS = ['#7fff7f', '#7fffff', '#7fbfff', '#bf7fff', '#ff7fdf', '#c8c8c8'];

const HEX_RE = /^#[0-9a-f]{6}$/i;
const cleanColor = (c, fallback = '#c8c8c8') => (typeof c === 'string' && HEX_RE.test(c) ? c.toLowerCase() : fallback);
const cleanText = (t, max = MAX_TEXT) => String(t ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** @returns {TierState} */
export function createTierList(title = '') {
  const tiers = DEFAULT_TIERS.map((t, i) => ({ id: `t${i + 1}`, label: t.label, color: t.color, items: [] }));
  return { title: cleanText(title, 80), seq: tiers.length, tiers, pool: [] };
}

/** Every list in the state: each tier's items, then the pool. */
const lists = (state) => [...state.tiers.map((t) => ({ id: t.id, items: t.items })), { id: POOL, items: state.pool }];

export const itemCount = (state) => lists(state).reduce((n, l) => n + l.items.length, 0);

/** { listId, index, item } for an item id, or null. */
export function findItem(state, itemId) {
  for (const l of lists(state)) {
    const index = l.items.findIndex((it) => it.id === itemId);
    if (index >= 0) return { listId: l.id, index, item: l.items[index] };
  }
  return null;
}

function withList(state, listId, fn) {
  if (listId === POOL) return { ...state, pool: fn(state.pool) };
  return { ...state, tiers: state.tiers.map((t) => (t.id === listId ? { ...t, items: fn(t.items) } : t)) };
}
const hasList = (state, listId) => listId === POOL || state.tiers.some((t) => t.id === listId);

/** Adds a text ({ text }) or image ({ src }) item to the pool (or to `listId`). Ignores empty or invalid items and the item cap. */
export function addItem(state, data, listId = POOL) {
  if (itemCount(state) >= MAX_ITEMS || !hasList(state, listId)) return state;
  const seq = state.seq + 1;
  let item;
  if (data && typeof data.src === 'string' && data.src.startsWith('data:image/')) {
    item = { id: `i${seq}`, type: 'image', src: data.src, text: cleanText(data.text) };
  } else {
    const text = cleanText(data && data.text);
    if (!text) return state;
    item = { id: `i${seq}`, type: 'text', text };
  }
  return withList({ ...state, seq }, listId, (items) => [...items, item]);
}

export function removeItem(state, itemId) {
  const at = findItem(state, itemId);
  return at ? withList(state, at.listId, (items) => items.filter((it) => it.id !== itemId)) : state;
}

/**
 * Moves an item to `listId` (a tier id or POOL) at `index` (counted after the item is taken out
 * of its old place; omitted or out of range = the end). Moving within a list reorders it.
 */
export function moveItem(state, itemId, listId, index) {
  const at = findItem(state, itemId);
  if (!at || !hasList(state, listId)) return state;
  const removed = withList(state, at.listId, (items) => items.filter((it) => it.id !== itemId));
  return withList(removed, listId, (items) => {
    const i = Number.isInteger(index) ? Math.max(0, Math.min(items.length, index)) : items.length;
    return [...items.slice(0, i), at.item, ...items.slice(i)];
  });
}

/** Moves an item one place left (-1) or right (+1) within its list. */
export function nudgeItem(state, itemId, delta) {
  const at = findItem(state, itemId);
  return at ? moveItem(state, itemId, at.listId, at.index + delta) : state;
}

export function renameTier(state, tierId, label) {
  return { ...state, tiers: state.tiers.map((t) => (t.id === tierId ? { ...t, label: String(label ?? '').slice(0, 24) } : t)) };
}

export function setTierColor(state, tierId, color) {
  return { ...state, tiers: state.tiers.map((t) => (t.id === tierId ? { ...t, color: cleanColor(color, t.color) } : t)) };
}

export function addTier(state, label, color) {
  if (state.tiers.length >= MAX_TIERS) return state;
  const seq = state.seq + 1;
  const used = new Set(state.tiers.map((t) => t.color));
  const auto = EXTRA_COLORS.find((c) => !used.has(c)) || EXTRA_COLORS[state.tiers.length % EXTRA_COLORS.length];
  const name = label ?? (DEFAULT_TIERS[state.tiers.length]?.label || String.fromCharCode(65 + Math.min(25, state.tiers.length - 1)));
  const tier = { id: `t${seq}`, label: String(name).slice(0, 24), color: cleanColor(color, auto), items: [] };
  return { ...state, seq, tiers: [...state.tiers, tier] };
}

/** Removes a tier; its items go back to the end of the unranked pool. Keeps at least one tier. */
export function removeTier(state, tierId) {
  const tier = state.tiers.find((t) => t.id === tierId);
  if (!tier || state.tiers.length <= 1) return state;
  return { ...state, tiers: state.tiers.filter((t) => t.id !== tierId), pool: [...state.pool, ...tier.items] };
}

/** Moves a tier up (-1) or down (+1). */
export function moveTier(state, tierId, delta) {
  const i = state.tiers.findIndex((t) => t.id === tierId);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= state.tiers.length) return state;
  const tiers = [...state.tiers];
  [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
  return { ...state, tiers };
}

export const setTitle = (state, title) => ({ ...state, title: String(title ?? '').slice(0, 80) });

export function serializeTierList(state) {
  return JSON.stringify({ v: 1, title: state.title, seq: state.seq, tiers: state.tiers, pool: state.pool });
}

/** Parses saved JSON back into a valid state, dropping anything malformed. Returns null if unusable. */
export function parseTierList(json) {
  let raw;
  try {
    raw = typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.tiers)) return null;
  const seen = new Set();
  let maxSeq = 0;
  const num = (id) => {
    const n = Number(String(id).slice(1));
    if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
  };
  let count = 0;
  const cleanItems = (items) =>
    (Array.isArray(items) ? items : []).flatMap((it) => {
      if (!it || typeof it.id !== 'string' || seen.has(it.id) || count >= MAX_ITEMS) return [];
      if (it.type === 'image' && typeof it.src === 'string' && it.src.startsWith('data:image/')) {
        seen.add(it.id);
        num(it.id);
        count++;
        return [{ id: it.id, type: 'image', src: it.src, text: cleanText(it.text) }];
      }
      const text = cleanText(it.text);
      if (it.type !== 'text' || !text) return [];
      seen.add(it.id);
      num(it.id);
      count++;
      return [{ id: it.id, type: 'text', text }];
    });
  const tierIds = new Set();
  const tiers = raw.tiers.slice(0, MAX_TIERS).flatMap((t) => {
    if (!t || typeof t.id !== 'string' || tierIds.has(t.id) || t.id === POOL) return [];
    tierIds.add(t.id);
    num(t.id);
    return [{ id: t.id, label: String(t.label ?? '').slice(0, 24), color: cleanColor(t.color), items: cleanItems(t.items) }];
  });
  if (!tiers.length) return null;
  const pool = cleanItems(raw.pool);
  const seq = Math.max(maxSeq, Number.isInteger(raw.seq) ? raw.seq : 0);
  return { title: String(raw.title ?? '').slice(0, 80), seq, tiers, pool };
}

/** Black or white text, whichever reads better on a tier colour. */
export function textColorFor(hex) {
  const c = cleanColor(hex);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? '#15171a' : '#ffffff';
}
