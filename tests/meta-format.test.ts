import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metaFormat, metaFormatProblem } from '../lib/server/meta-format.ts';

const img = { mime: 'image/jpeg' };
const vid = { mime: 'video/mp4' };

test('Post as defaults to a feed post and only accepts reel or story otherwise', () => {
  assert.equal(metaFormat(undefined), 'post');
  assert.equal(metaFormat(null), 'post');
  assert.equal(metaFormat({ format: 'reel' }), 'reel');
  assert.equal(metaFormat({ format: 'story' }), 'story');
  assert.equal(metaFormat({ format: 'carousel' }), 'post');
});

test('a Reel is exactly one video; a Story is exactly one image or video', () => {
  assert.equal(metaFormatProblem('reel', [vid]), null);
  assert.match(metaFormatProblem('reel', [img])!, /one video/);
  assert.match(metaFormatProblem('reel', [vid, vid])!, /one video/);
  assert.equal(metaFormatProblem('story', [img]), null);
  assert.equal(metaFormatProblem('story', [vid]), null);
  assert.match(metaFormatProblem('story', [img, img])!, /one image or video/);
  assert.match(metaFormatProblem('story', [])!, /one image or video/);
  assert.equal(metaFormatProblem('post', [img, vid, img]), null);
});
