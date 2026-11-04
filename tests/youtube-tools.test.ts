import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeLink } from '../lib/tools/youtube-ids.js';
import { baseImage, isYouTubeImage, toFetchUrl } from '../lib/server/youtube-avatar';
import { checkHandle } from '../lib/tools/handles.js';

test('video ID finder reads every common YouTube link shape', () => {
  assert.equal(parseYouTubeLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')?.videoId, 'dQw4w9WgXcQ');
  assert.equal(parseYouTubeLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')?.start, '42s');
  assert.equal(parseYouTubeLink('youtu.be/dQw4w9WgXcQ')?.videoId, 'dQw4w9WgXcQ');
  assert.equal(parseYouTubeLink('https://youtube.com/shorts/abcdefghijk')?.videoId, 'abcdefghijk');
  assert.equal(parseYouTubeLink('https://www.youtube.com/embed/abcdefghijk')?.videoId, 'abcdefghijk');
  assert.equal(parseYouTubeLink('https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ')?.channelId, 'UCBJycsmduvYEL83R_U4JriQ');
  assert.equal(parseYouTubeLink('https://www.youtube.com/@mkbhd')?.handle, '@mkbhd');
  assert.equal(parseYouTubeLink('https://www.youtube.com/playlist?list=PL123')?.playlistId, 'PL123');
  assert.equal(parseYouTubeLink('dQw4w9WgXcQ')?.videoId, 'dQw4w9WgXcQ');
  assert.equal(parseYouTubeLink('https://vimeo.com/123'), null);
  assert.equal(parseYouTubeLink('not a link'), null);
});

test('PFP downloader turns channel input into a page to fetch, and only trusts YouTube image hosts', () => {
  assert.deepEqual(toFetchUrl('@mkbhd'), { url: 'https://www.youtube.com/@mkbhd', isVideo: false });
  assert.deepEqual(toFetchUrl('mkbhd'), { url: 'https://www.youtube.com/@mkbhd', isVideo: false });
  assert.deepEqual(toFetchUrl('UCBJycsmduvYEL83R_U4JriQ'), { url: 'https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ', isVideo: false });
  assert.deepEqual(toFetchUrl('https://m.youtube.com/c/Something/videos'), { url: 'https://www.youtube.com/c/Something', isVideo: false });
  assert.deepEqual(toFetchUrl('https://youtu.be/dQw4w9WgXcQ'), { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isVideo: true });
  assert.equal(toFetchUrl('https://example.com/@mkbhd'), null);
  assert.equal(toFetchUrl(''), null);
  assert.equal(baseImage('https://yt3.googleusercontent.com/abc=s900-c-k-c0x00ffffff-no-rj'), 'https://yt3.googleusercontent.com/abc');
  assert.equal(baseImage('https://yt3.googleusercontent.com/zi_48H=w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj'), 'https://yt3.googleusercontent.com/zi_48H');
  assert.ok(isYouTubeImage('https://yt3.googleusercontent.com/abc=s800'));
  assert.ok(isYouTubeImage('https://yt3.ggpht.com/abc=s800'));
  assert.ok(!isYouTubeImage('https://evil.example.com/yt3.googleusercontent.com.png'));
  assert.ok(!isYouTubeImage('http://yt3.googleusercontent.com/abc'));
});

test('new username checkers apply each platform’s rules', () => {
  assert.ok(checkHandle('Block_Builder', 'minecraft').ok);
  assert.ok(!checkHandle('ab', 'minecraft').ok);
  assert.ok(!checkHandle('this_name_is_way_too_long', 'minecraft').ok);
  assert.ok(checkHandle('sunny.days', 'snapchat').ok);
  assert.ok(!checkHandle('1sunny', 'snapchat').ok);
  assert.ok(!checkHandle('sunny.days.x', 'snapchat').ok);
  assert.ok(!checkHandle('sunny_', 'snapchat').ok);
  assert.ok(checkHandle('cozyhomeideas', 'pinterest').ok);
  assert.ok(checkHandle('riverside.bakery', 'facebook').ok);
  assert.ok(!checkHandle('abc', 'facebook').ok);
  assert.ok(!checkHandle('river..bakery', 'facebook').ok);
});
