import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ITEMS,
  POOL,
  addItem,
  addTier,
  createTierList,
  findItem,
  itemCount,
  moveItem,
  moveTier,
  nudgeItem,
  parseTierList,
  removeItem,
  removeTier,
  renameTier,
  serializeTierList,
  setTierColor,
  textColorFor,
} from '../lib/tools/tierlist.js';

const IMG = 'data:image/png;base64,iVBORw0KGgo=';
const ids = (items: { id: string }[]) => items.map((i) => i.id);

test('starts with S/A/B/C/D in the classic colours and an empty pool', () => {
  const s = createTierList('Best ramen');
  assert.equal(s.title, 'Best ramen');
  assert.deepEqual(s.tiers.map((t) => t.label), ['S', 'A', 'B', 'C', 'D']);
  assert.equal(s.tiers[0].color, '#ff7f7f');
  assert.deepEqual(s.pool, []);
});

test('adds text and image items to the pool, ignoring empty and unsafe ones', () => {
  let s = createTierList();
  s = addItem(s, { text: '  Tonkotsu  ' });
  s = addItem(s, { src: IMG });
  s = addItem(s, { text: '   ' });
  s = addItem(s, { src: 'javascript:alert(1)' });
  assert.equal(s.pool.length, 2);
  assert.equal(s.pool[0].type, 'text');
  assert.equal(s.pool[0].text, 'Tonkotsu');
  assert.equal(s.pool[1].type, 'image');
  assert.notEqual(s.pool[0].id, s.pool[1].id);
  s = addItem(s, { text: 'Shio' }, s.tiers[0].id);
  assert.equal(s.tiers[0].items[0].text, 'Shio');
});

test('moves items between tiers, the pool and positions', () => {
  let s = createTierList();
  for (const text of ['a', 'b', 'c', 'd']) s = addItem(s, { text });
  const [a, b, c, d] = ids(s.pool);
  const S = s.tiers[0].id;
  s = moveItem(s, a, S);
  s = moveItem(s, b, S);
  s = moveItem(s, c, S, 0);
  assert.deepEqual(ids(s.tiers[0].items), [c, a, b]);
  assert.deepEqual(ids(s.pool), [d]);
  // Reorder within a tier: index counts after removal.
  s = moveItem(s, c, S, 2);
  assert.deepEqual(ids(s.tiers[0].items), [a, b, c]);
  s = nudgeItem(s, c, -1);
  assert.deepEqual(ids(s.tiers[0].items), [a, c, b]);
  s = nudgeItem(s, a, -1);
  assert.deepEqual(ids(s.tiers[0].items), [a, c, b]);
  s = moveItem(s, b, POOL, 0);
  assert.deepEqual(ids(s.pool), [b, d]);
  assert.deepEqual(findItem(s, c), { listId: S, index: 1, item: s.tiers[0].items[1] });
  assert.equal(moveItem(s, 'nope', S), s);
  assert.equal(moveItem(s, a, 'missing'), s);
  s = removeItem(s, a);
  assert.equal(findItem(s, a), null);
  assert.equal(itemCount(s), 3);
});

test('renames, recolours, adds, reorders and removes tiers', () => {
  let s = createTierList();
  s = addItem(s, { text: 'x' }, s.tiers[4].id);
  const D = s.tiers[4].id;
  s = renameTier(s, s.tiers[0].id, 'God tier');
  assert.equal(s.tiers[0].label, 'God tier');
  s = setTierColor(s, s.tiers[0].id, '#123ABC');
  assert.equal(s.tiers[0].color, '#123abc');
  s = setTierColor(s, s.tiers[0].id, 'red; background:url(x)');
  assert.equal(s.tiers[0].color, '#123abc');
  s = addTier(s);
  assert.equal(s.tiers.length, 6);
  assert.equal(s.tiers[5].label, 'E');
  assert.equal(s.tiers[5].color, '#7fff7f');
  assert.equal(new Set(s.tiers.map((t) => t.id)).size, 6);
  s = moveTier(s, s.tiers[5].id, -1);
  assert.equal(s.tiers[4].label, 'E');
  s = removeTier(s, D);
  assert.equal(s.tiers.length, 5);
  assert.deepEqual(s.pool.map((i) => i.text), ['x']);
  let one = createTierList();
  for (const t of one.tiers.slice(1)) one = removeTier(one, t.id);
  assert.equal(one.tiers.length, 1);
  assert.equal(removeTier(one, one.tiers[0].id), one);
});

test('serializes to JSON and back, rejecting junk', () => {
  let s = createTierList('My list');
  s = addItem(s, { text: 'one' });
  s = addItem(s, { src: IMG }, s.tiers[1].id);
  s = addTier(s, 'F', '#000000');
  const back = parseTierList(serializeTierList(s));
  assert.deepEqual(back, s);
  // New ids after a restore never collide with restored ones.
  const next = addItem(back!, { text: 'two' });
  assert.equal(new Set(ids(next.pool).concat(ids(next.tiers[1].items))).size, 3);

  assert.equal(parseTierList('not json'), null);
  assert.equal(parseTierList('{"tiers":[]}'), null);
  const dirty = parseTierList({
    title: 'T',
    tiers: [{ id: 't1', label: 'S', color: 'bad', items: [{ id: 'i1', type: 'image', src: 'http://evil/x.png' }, { id: 'i2', type: 'text', text: 'ok' }, { id: 'i2', type: 'text', text: 'dupe' }] }],
    pool: [{ id: 'i3', type: 'weird' }],
  });
  assert.deepEqual(dirty, { title: 'T', seq: 2, tiers: [{ id: 't1', label: 'S', color: '#c8c8c8', items: [{ id: 'i2', type: 'text', text: 'ok' }] }], pool: [] });
});

test('caps the number of items and picks readable text colours', () => {
  let s = createTierList();
  for (let i = 0; i < MAX_ITEMS + 5; i++) s = addItem(s, { text: `n${i}` });
  assert.equal(itemCount(s), MAX_ITEMS);
  assert.equal(textColorFor('#ffff7f'), '#15171a');
  assert.equal(textColorFor('#1a1a40'), '#ffffff');
});
