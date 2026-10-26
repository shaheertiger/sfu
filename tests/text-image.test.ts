import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alignX, blockTop, contrastColor, fitText, originalSize, tokenize, wrapText } from '../lib/tools/text-image.js';

// Fake measure: every character is 0.5em wide, CJK characters 1em.
const measure = (str: string, size: number) =>
  Array.from(str).reduce((w, ch) => w + (/[　-鿿＀-￯]/.test(ch) ? size : size * 0.5), 0);

test('tokenize splits words, spaces and single CJK characters', () => {
  assert.deepEqual(tokenize('Hi there'), ['Hi', ' ', 'there']);
  assert.deepEqual(tokenize('速報です'), ['速', '報', 'で', 'す']);
  assert.deepEqual(tokenize('新iPhone発売'), ['新', 'iPhone', '発', '売']);
});

test('Latin text wraps between words and keeps explicit newlines', () => {
  // size 10 → 5px per char; 50px fits 10 characters.
  assert.deepEqual(wrapText('the quick brown fox jumps', 50, 10, measure), ['the quick', 'brown fox', 'jumps']);
  assert.deepEqual(wrapText('a\n\nb', 50, 10, measure), ['a', '', 'b']);
  assert.deepEqual(wrapText('abcdefghijklmnop', 50, 10, measure), ['abcdefghij', 'klmnop']);
});

test('Japanese wraps by character with kinsoku rules', () => {
  // size 10 → 10px per CJK char; 40px fits 4.
  assert.deepEqual(wrapText('あいうえおかきく', 40, 10, measure), ['あいうえ', 'おかきく']);
  // 「。」 must not start a line: it hangs on the line before.
  assert.deepEqual(wrapText('あいうえ。かき', 40, 10, measure), ['あいうえ。', 'かき']);
  // 「 must not end a line: it moves down with the next character.
  assert.deepEqual(wrapText('あいう「えお」', 40, 10, measure), ['あいう', '「えお」']);
});

test('fitText shrinks the size until the block fits the height', () => {
  const big = fitText('one two three four five six', { maxWidth: 100, maxHeight: 1000, fontSize: 20 }, measure);
  assert.equal(big.fontSize, 20);
  assert.equal(big.shrunk, false);
  const tight = fitText('one two three four five six', { maxWidth: 100, maxHeight: 40, fontSize: 20, minFontSize: 4 }, measure);
  assert.ok(tight.fontSize < 20);
  assert.ok(tight.height <= 40);
  assert.equal(tight.shrunk, true);
  const floor = fitText('x '.repeat(500), { maxWidth: 50, maxHeight: 10, fontSize: 40, minFontSize: 12 }, measure);
  assert.equal(floor.fontSize, 12);
});

test('position, alignment, contrast and original size helpers', () => {
  assert.equal(blockTop('top', 1000, 200, 50), 50);
  assert.equal(blockTop('middle', 1000, 200, 50), 400);
  assert.equal(blockTop('bottom', 1000, 200, 50), 750);
  assert.equal(alignX('left', 10, 100), 10);
  assert.equal(alignX('center', 10, 100), 60);
  assert.equal(alignX('right', 10, 100), 110);
  assert.equal(contrastColor('#ffffff'), '#000000');
  assert.equal(contrastColor('#111111'), '#ffffff');
  assert.deepEqual(originalSize(4032, 3024), { w: 2160, h: 1620 });
  assert.deepEqual(originalSize(800, 600), { w: 800, h: 600 });
});
