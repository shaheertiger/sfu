import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIcs, fold, icsDate, icsText } from '../lib/server/ics.ts';

test('dates, escaping and folding follow RFC 5545', () => {
  assert.equal(icsDate(Date.UTC(2026, 10, 2, 14, 0, 0)), '20261102T140000Z');
  assert.equal(icsText('a;b,c\\d\nnew'), 'a\;b\\,c\\\\d\\nnew');
  const long = 'SUMMARY:' + 'é'.repeat(60);
  const folded = fold(long);
  for (const line of folded.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `line too long: ${Buffer.byteLength(line)}`);
  assert.equal(folded.replace(/\r\n /g, ''), long); // unfolding gives the original back
  assert.equal(fold('short'), 'short');
});

test('the feed lists each post as an event with status and links, CRLF-terminated', () => {
  const ics = buildIcs({
    name: 'Harbor Bakery', tz: 'Europe/London', domain: 'scheduleforyou.com', stamp: Date.UTC(2026, 9, 25, 9, 0, 0),
    posts: [
      { id: 'post_1', caption: 'Autumn menu, Monday; come hungry.', at: Date.UTC(2026, 10, 2, 14, 0, 0), status: 'scheduled', approval: 'pending', platforms: ['X / Twitter', 'LinkedIn'] },
      { id: 'post_2', caption: 'Done', at: Date.UTC(2026, 9, 20, 9, 0, 0), status: 'published', approval: null, platforms: ['Instagram'], url: 'https://www.instagram.com/p/abc/' },
    ],
  });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.match(ics, /X-WR-CALNAME:Harbor Bakery · Schedule For You\r\n/);
  assert.match(ics, /UID:post_1@scheduleforyou.com\r\nDTSTAMP:20261025T090000Z\r\nDTSTART:20261102T140000Z\r\nDTEND:20261102T141500Z\r\nSUMMARY:X \/ Twitter\\, LinkedIn: Autumn menu\\, Monday\; come hungry\.\r\n/);
  assert.match(ics, /DESCRIPTION:Waiting for approval\\n\\nAutumn menu/);
  assert.match(ics, /STATUS:TENTATIVE/);
  assert.match(ics, /UID:post_2@[\s\S]*STATUS:CONFIRMED\r\nCATEGORIES:Published\r\nURL:https:\/\/www\.instagram\.com\/p\/abc\/\r\n/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.ok(!/[^\r]\n/.test(ics), 'every line ends with CRLF');
});
