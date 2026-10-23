import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STYLES, convert, stylesFor } from '../lib/tools/unicode.js';
import { BLANK, instagramLineBreaks, xLength } from '../lib/tools/counters.js';
import { BIO_PLATFORMS, NAME_RULES, generateBios, generateComments, generateNames } from '../lib/tools/generators.js';

test('font styles map letters and fill the gaps in the math blocks', () => {
  assert.equal(convert('Hello', 'bold'), '𝐇𝐞𝐥𝐥𝐨');
  assert.equal(convert('Hi', 'script'), 'ℋ𝒾');
  assert.equal(convert('h', 'italic'), 'ℎ');
  assert.equal(convert('CHRZ', 'fraktur'), 'ℭℌℜℨ');
  assert.equal(convert('NQ', 'doubleStruck'), 'ℕℚ');
  assert.equal(convert('ab!', 'upsideDown'), '¡qɐ');
  assert.equal(convert('a b', 'strike'), 'a̶ b̶');
  for (const s of STYLES) assert.equal(typeof convert('Test 123 ✓', s.id), 'string');
  assert.equal(stylesFor('bold').length, 9);
  assert.ok(stylesFor('all').length >= 24);
});

test('X counts links as 23, emoji and CJK as 2', () => {
  assert.equal(xLength('hello').length, 5);
  assert.equal(xLength('https://example.com/a-very-long-path-that-goes-on').length, 23);
  assert.equal(xLength('👋').length, 2);
  assert.equal(xLength('👨‍👩‍👧').length, 2);
  assert.equal(xLength('你好').length, 4);
  assert.equal(xLength('go to example.com now').length, 'go to  now'.length + 23);
});

test('Instagram line breaks keep empty lines with an invisible character', () => {
  assert.equal(instagramLineBreaks('a  \n\n\nb\n'), `a\n${BLANK}\n${BLANK}\nb`);
  assert.equal(instagramLineBreaks('one line'), 'one line');
});

test('name ideas follow each platform’s rules', () => {
  for (const [platform, rule] of Object.entries(NAME_RULES) as [string, any][]) {
    for (const style of ['cool', 'aesthetic', 'funny', 'professional', 'gaming', 'minimal']) {
      const names = generateNames({ keyword: 'Café Art 2', style, platform });
      assert.ok(names.length >= 20, `${platform}/${style}: ${names.length}`);
      for (const n of names) {
        const len = Array.from(n).length;
        assert.ok(len >= rule.min && len <= rule.max, `${platform}: ${n}`);
        if (rule.mode === 'handle') {
          rule.allowed.lastIndex = 0;
          assert.ok(!rule.allowed.test(n), `${platform}: bad character in ${n}`);
          rule.allowed.lastIndex = 0;
        }
        if (rule.startLetter) assert.match(n, /^[a-z]/i);
      }
      assert.equal(new Set(names.map((n) => n.toLowerCase())).size, names.length, 'no duplicates');
    }
  }
  assert.notDeepEqual(generateNames({ keyword: 'pixel', seed: 0 }), generateNames({ keyword: 'pixel', seed: 1 }));
});

test('bios fit the platform limit', () => {
  for (const [platform, cfg] of Object.entries(BIO_PLATFORMS)) {
    for (const tone of ['friendly', 'professional', 'funny', 'minimal', 'aesthetic']) {
      for (const emoji of [true, false]) {
        const bios = generateBios({ role: 'wedding photographer', topic: 'candid moments', tone, platform, emoji });
        assert.ok(bios.length >= 4, `${platform}/${tone}: ${bios.length}`);
        for (const b of bios) assert.ok(Array.from(b).length <= cfg.limit, `${platform}: ${b}`);
        if (!emoji) for (const b of bios) assert.ok(!/\p{Extended_Pictographic}/u.test(b), `${platform}/${tone}: emoji in ${b}`);
      }
    }
  }
});

test('comment ideas use the topic and change with the seed', () => {
  const a = generateComments({ topic: 'latte art', tone: 'question' });
  assert.equal(a.length, 12);
  assert.ok(a.every((c: string) => /latte art/i.test(c)));
  assert.notDeepEqual(a, generateComments({ topic: 'latte art', tone: 'question', seed: 2 }));
});
