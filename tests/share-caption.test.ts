import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookmarklet, isShare, pickUrl, shareCaption } from '../lib/share-caption.js';

const q = (s: string) => new URLSearchParams(s);

test('only share parameters open the composer', () => {
  assert.equal(isShare(q('share=1')), true);
  assert.equal(isShare(q('text=hello')), true);
  assert.equal(isShare(q('billing=success')), false);
  assert.equal(isShare(q('')), false);
});

test('shared text and link become a caption; duplicates and junk links are dropped', () => {
  assert.equal(shareCaption(q('title=Our%20menu&url=https%3A%2F%2Fexample.com%2Fmenu')), 'Our menu\n\nhttps://example.com/menu');
  assert.equal(shareCaption(q('title=Page&text=Quoted%20line&url=https%3A%2F%2Fexample.com%2Fa')), 'Quoted line\n\nhttps://example.com/a');
  // Android apps often send the URL in `text` and nothing in `url`.
  assert.equal(shareCaption(q('text=https%3A%2F%2Fexample.com%2Fa')), 'https://example.com/a');
  assert.equal(shareCaption(q('text=Read%20this%20https%3A%2F%2Fexample.com%2Fa&url=https%3A%2F%2Fexample.com%2Fa')), 'Read this https://example.com/a');
  assert.equal(shareCaption(q('text=hello&url=javascript%3Aalert(1)')), 'hello');
  assert.equal(shareCaption(q('share=1')), '');
  assert.equal(shareCaption(q('text=' + encodeURIComponent('x'.repeat(6000)))).length, 5000);
});

test('urls are checked', () => {
  assert.equal(pickUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(pickUrl('HTTP://example.com'), 'http://example.com/');
  assert.equal(pickUrl('example.com'), '');
  assert.equal(pickUrl('javascript:alert(1)'), '');
  assert.equal(pickUrl(''), '');
});

test('the bookmarklet opens the composer on the app domain with title, selection and address', () => {
  const b = bookmarklet('https://scheduleforyou.com/');
  assert.ok(b.startsWith('javascript:void(open("https://scheduleforyou.com/app?share=1"'));
  assert.match(b, /document\.title/);
  assert.match(b, /getSelection\(\)/);
  assert.match(b, /location\.href/);
  assert.doesNotMatch(b, /\n/);
});
