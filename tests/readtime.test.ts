import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PACES, countScript, formatDuration, readingSeconds, speakingSeconds, targetFit, targetLabel } from '../lib/tools/readtime.js';

test('counts Japanese characters without spaces or punctuation, and other words separately', () => {
  assert.deepEqual(countScript(''), { ja: 0, words: 0, chars: 0 });
  assert.equal(countScript('こんにちは、世界。').ja, 7);
  assert.equal(countScript('「カタカナ」とひらがな！').ja, 9);
  assert.equal(countScript('コーヒー々').ja, 5);
  assert.equal(countScript('ｶﾀｶﾅ').ja, 4);
  const mixed = countScript('今日はReelsの話。Let’s go! 3 tips');
  assert.equal(mixed.ja, 5);
  assert.equal(mixed.words, 5); // Reels, Let’s, go, 3, tips
  assert.equal(countScript("don't stop-motion 2.5x").words, 3);
  assert.equal(countScript('a b\n c').chars, 3);
});

test('speaking time: 300 Japanese characters or 150 words take a minute at normal pace', () => {
  assert.equal(speakingSeconds({ ja: 300, words: 0 }), 60);
  assert.equal(speakingSeconds({ ja: 0, words: 150 }, 'normal'), 60);
  assert.equal(speakingSeconds({ ja: 250, words: 130 }, 'slow'), 120);
  assert.equal(speakingSeconds({ ja: 350, words: 0 }, 'fast'), 60);
  assert.equal(Math.round(speakingSeconds({ ja: 0, words: 170 }, 'fast')), 60);
  assert.equal(speakingSeconds({ ja: 0, words: 75 }, { ja: 300, en: 150 }), 30);
  assert.deepEqual(Object.keys(PACES), ['slow', 'normal', 'fast']);
});

test('reading time uses ~500 characters and ~238 words a minute', () => {
  assert.equal(readingSeconds({ ja: 500, words: 0 }), 60);
  assert.equal(readingSeconds({ ja: 0, words: 238 }), 60);
});

test('durations format as m:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(5.4), '0:05');
  assert.equal(formatDuration(75), '1:15');
  assert.equal(formatDuration(599.6), '10:00');
  assert.equal(formatDuration(3725), '1:02:05');
  assert.equal(targetLabel(15), '15s');
  assert.equal(targetLabel(90), '90s');
  assert.equal(targetLabel(180), '3 min');
  assert.equal(targetLabel(300, 'ja'), '5分');
  assert.equal(targetLabel(30, 'ja'), '30秒');
});

test('target fit: capacity and how far over or under the script is', () => {
  const en = targetFit({ ja: 0, words: 100 }, 30);
  assert.equal(en.unit, 'en');
  assert.equal(en.fit, 75);
  assert.equal(en.diff, 25);
  assert.equal(en.diffSeconds, 10);
  assert.equal(en.jaFit, 150);
  assert.equal(en.enFit, 75);

  const ja = targetFit({ ja: 120, words: 0 }, 30);
  assert.equal(ja.unit, 'ja');
  assert.equal(ja.fit, 150);
  assert.equal(ja.diff, -30);
  assert.equal(ja.diffSeconds, -6);

  // A mostly Japanese script with some English: the English time comes off the budget.
  const mixed = targetFit({ ja: 200, words: 15 }, 60);
  assert.equal(mixed.unit, 'ja');
  assert.equal(mixed.fit, 270); // (60 − 6 s) × 300 / 60
  assert.equal(mixed.diff, -70);

  assert.equal(targetFit({ ja: 0, words: 0 }, 60, 'normal', 'ja').unit, 'ja');
  assert.equal(targetFit({ ja: 0, words: 0 }, 60).unit, 'en');
  assert.equal(targetFit({ ja: 0, words: 400 }, 60, 'fast').fit, 170);
  assert.equal(targetFit({ ja: 10, words: 400 }, 1).fit, 0);
});
