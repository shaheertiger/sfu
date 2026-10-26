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
    for (const style of ['cool', 'aesthetic', 'funny', 'professional', 'gaming', 'minimal', 'finsta']) {
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

import { checkHandle, handleVariations } from '../lib/tools/handles.js';
import { TAG_LIMIT, checkTitle, generateTags, tagsLength } from '../lib/tools/youtube.js';
import { compareLists, parseExport } from '../lib/tools/instagram-export.js';
import { toPlain } from '../lib/tools/unicode.js';

test('handle checks follow Instagram and TikTok rules', () => {
  assert.equal(checkHandle('@golden.hour', 'instagram').ok, true);
  assert.equal(checkHandle('.golden', 'instagram').ok, false);
  assert.equal(checkHandle('gold..en', 'instagram').ok, false);
  assert.equal(checkHandle('golden.', 'tiktok').ok, false);
  assert.equal(checkHandle('a'.repeat(31), 'instagram').ok, false);
  assert.equal(checkHandle('has space', 'instagram').ok, false);
  for (const p of ['instagram', 'tiktok']) for (const v of handleVariations('Café Art!', p)) assert.ok(checkHandle(v, p).ok, `${p}: ${v}`);
});

test('YouTube title checklist and tags stay within limits', () => {
  assert.ok(checkTitle('How to Make Cold Brew at Home (3 Easy Steps)', 'cold brew').score >= 90);
  assert.ok(checkTitle('WOW!!! 🔥🔥🔥🔥', '').score < 50);
  assert.equal(checkTitle('x'.repeat(101)).checks.find((c) => c.id === 'limit')?.pass, false);
  const tags = generateTags('a very long topic about home espresso machines', 'grinder, latte art, milk steaming, tamping, crema');
  assert.ok(tagsLength(tags) <= TAG_LIMIT);
  assert.equal(tagsLength(['one', 'two words']), 3 + 1 + 9 + 2);
});

test('Instagram export files are read and compared', () => {
  const followers = parseExport(JSON.stringify([{ string_list_data: [{ href: 'https://www.instagram.com/alice', value: 'alice' }] }]), 'followers_1.json');
  const following = parseExport(
    JSON.stringify({ relationships_following: [{ title: 'bob', string_list_data: [{ href: 'https://www.instagram.com/_u/bob' }] }, { string_list_data: [{ value: 'Alice' }] }] }),
    'following.json',
  );
  assert.equal(followers.kind, 'followers');
  assert.equal(following.kind, 'following');
  assert.deepEqual(compareLists(followers.usernames, following.usernames).notBack, ['bob']);
  const html = parseExport('<a target="_blank" href="https://www.instagram.com/carol">carol</a>', 'followers_1.html');
  assert.deepEqual([...html.usernames], ['carol']);
});

test('styled text converts back to plain', () => {
  assert.equal(toPlain('𝐇𝐞𝐥𝐥𝐨 𝗪𝗼𝗿𝗹𝗱 a̶b̶'), 'Hello World ab');
});

import { generateCaptions } from '../lib/tools/generators.js';

test('TikTok captions use the topic, the call to action and the hashtags', () => {
  const caps = generateCaptions({ topic: 'sourdough', style: 'howto', cta: 'save', hashtags: 'baking, #bread lover' });
  assert.equal(caps.length, 10);
  for (const c of caps) {
    assert.ok(/sourdough/i.test(c), c);
    assert.ok(c.endsWith('#baking #bread #lover'), c);
    assert.ok(/save|bookmark/i.test(c), c);
  }
  assert.notDeepEqual(caps, generateCaptions({ topic: 'sourdough', style: 'howto', cta: 'save', hashtags: 'baking', seed: 1 }));
});

test('accented letters keep their accent on a styled base letter', () => {
  assert.equal(convert('é', 'bold'), '𝐞́');
  assert.equal(convert('Grüße', 'sansBold'), '𝗚𝗿𝘂̈ß𝗲');
  assert.equal(convert('ça', 'script'), '𝒸̧𝒶');
  assert.equal(convert('インスタ', 'bold'), 'インスタ', 'Japanese text passes through');
});

test('French bios fit Instagram’s limit and use the French templates', () => {
  for (const tone of ['friendly', 'professional', 'funny', 'minimal', 'aesthetic']) {
    for (const emoji of [true, false]) {
      const bios = generateBios({ role: 'photographe', topic: 'photos de rue', tone, platform: 'instagram', emoji, lang: 'fr' });
      assert.ok(bios.length >= 8, `${tone}: ${bios.length}`);
      for (const b of bios) assert.ok(Array.from(b).length <= 150, b);
      assert.ok(bios.some((b) => /photographe|photos de rue/i.test(b)));
    }
  }
  assert.deepEqual(generateBios({ role: 'baker', topic: 'bread', lang: 'xx' }), generateBios({ role: 'baker', topic: 'bread' }));
});

import { HANDLE_RULES, checkEverywhere, checkList } from '../lib/tools/handles.js';
import { SHADOWBAN_PLATFORMS, shadowbanVerdict } from '../lib/tools/shadowban.js';

test('handle rules per platform', () => {
  assert.equal(checkHandle('@golden.hour', 'instagram').ok, true);
  assert.match(checkHandle('golden..hour', 'instagram').problems.join(' '), /Two periods/);
  assert.equal(checkHandle('pixel_raider', 'twitch').ok, true);
  assert.match(checkHandle('_pixel', 'twitch').problems.join(' '), /underscore/);
  assert.match(checkHandle('abc', 'twitch').problems.join(' '), /Too short/);
  assert.equal(checkHandle('Night.Owl', 'discord').handle, 'night.owl', 'Discord lowercases');
  assert.equal(checkHandle('Night.Owl', 'discord').ok, true);
  assert.match(checkHandle('night..owl', 'discord').problems.join(' '), /Two periods/);
  assert.equal(checkHandle('Block_Builder', 'roblox').ok, true);
  assert.match(checkHandle('Block_Build_er', 'roblox').problems.join(' '), /one underscore/);
  assert.match(checkHandle('_Block', 'roblox').problems.join(' '), /start or end/);
  assert.equal(checkHandle('market_notes', 'telegram').ok, true);
  assert.match(checkHandle('1market', 'telegram').problems.join(' '), /start with a letter/);
  assert.match(checkHandle('market_', 'telegram').problems.join(' '), /end with an underscore/);
  assert.equal(checkHandle('weeknight-dinners', 'youtube').ok, true);
  assert.equal(checkHandle('すし大好き', 'youtube').ok, true, 'YouTube handles allow other scripts');
});

test('every platform, lists and variations', () => {
  const all = checkEverywhere('pixel_raider');
  assert.equal(all.length, 9);
  assert.equal(all.find((r) => r.platform === 'discord')!.profile, null);
  assert.equal(all.find((r) => r.platform === 'twitch')!.profile, 'https://www.twitch.tv/pixel_raider');
  assert.equal(all.find((r) => r.platform === 'x')!.ok, true);
  const list = checkList('one.two\n@one.two, bad name\n\nthree', 'instagram');
  assert.deepEqual(list.map((r) => r.handle), ['one.two', 'bad name', 'three']);
  assert.deepEqual(list.map((r) => r.ok), [true, false, true]);
  for (const p of Object.keys(HANDLE_RULES)) for (const v of handleVariations('golden hour', p)) assert.ok(checkHandle(v, p).ok, `${p}: ${v}`);
});

test('shadowban verdicts', () => {
  assert.equal(shadowbanVerdict('x', {}).level, 'unknown');
  assert.equal(shadowbanVerdict('x', { status: 'yes' }).level, 'confirmed');
  assert.equal(shadowbanVerdict('x', { status: 'no' }).level, 'clear');
  assert.equal(shadowbanVerdict('x', { status: 'no', search: 'no' }).level, 'watch');
  assert.equal(shadowbanVerdict('x', { search: 'no', replies: 'yes' }).level, 'likely');
  assert.equal(shadowbanVerdict('reddit', { profile: 'no' }).level, 'confirmed');
  for (const [id, p] of Object.entries(SHADOWBAN_PLATFORMS)) {
    assert.ok(p.checks.some((c: any) => c.strong), `${id} needs a decisive check`);
    for (const c of p.checks as any[]) assert.ok(['yes', 'no'].includes(c.bad), `${id}.${c.id}`);
  }
});

import { crc32, makeZip } from '../lib/tools/zip.js';

test('the ZIP writer produces a valid stored archive', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  const zip = makeZip([{ name: 'grid-01.jpg', data: new Uint8Array([1, 2, 3]) }, { name: 'grid-02.jpg', data: new Uint8Array([4, 5]) }], new Date(2026, 9, 26, 12, 0, 0));
  const view = new DataView(zip.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  const end = zip.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50);
  assert.equal(view.getUint16(end + 10, true), 2);
});
