import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baselineGrid, bestWeekday, countryOfTimezone, formatHour, gridFromRows, gridTotal, pickGrid, scoreGrid, topHoursOfDay, topSlots, MIN_POSTS_GLOBAL, MIN_POSTS_REGION } from '../lib/best-time.js';
import { allBestTimePages, pageCopy, pageFaq, parseSegment, siblingLinks } from '../lib/best-time-pages.js';
import { SPEC_PLATFORMS, allSpecPages, specBySlug } from '../lib/specs.js';
import { INDUSTRIES, TEMPLATES, allPostIdeaPages, fill, ideasFor, ideasForDay } from '../lib/post-ideas.js';
import { anonKey, nextUtcMidnight, utcDay } from '../lib/server/anon-cap.ts';

test('timezones map to countries and unknown zones to nothing', () => {
  assert.equal(countryOfTimezone('America/New_York'), 'US');
  assert.equal(countryOfTimezone('Asia/Kolkata'), 'IN');
  assert.equal(countryOfTimezone('Antarctica/Troll'), null);
});

test('scores run 0–100 with the busiest slot at 100 and clicks lifting a slot', () => {
  const g = gridFromRows([{ weekday: 1, hour: 9, posts: 100, clicks: 0 }, { weekday: 2, hour: 9, posts: 100, clicks: 50 }, { weekday: 3, hour: 20, posts: 10, clicks: 0 }]);
  const s = scoreGrid(g);
  assert.equal(s[2][9], 100, 'same posts, more clicks wins');
  assert.equal(s[1][9], 50);
  assert.ok(s[3][20] > 0 && s[3][20] < 10);
  assert.equal(s[0][0], 0);
  assert.deepEqual(topSlots(s, 1)[0], { weekday: 2, hour: 9, score: 100 });
  assert.equal(bestWeekday(s), 2);
  assert.equal(topHoursOfDay(s, 3, 1)[0].hour, 20);
});

test('pickGrid prefers region, then global, then baseline, by sample size', () => {
  const rows = (n: number) => [{ weekday: 1, hour: 9, posts: n, clicks: 0 }];
  assert.equal(pickGrid({ regionRows: rows(MIN_POSTS_REGION), globalRows: rows(MIN_POSTS_GLOBAL), platformId: 'instagram' }).source, 'region');
  assert.equal(pickGrid({ regionRows: rows(10), globalRows: rows(MIN_POSTS_GLOBAL), platformId: 'instagram' }).source, 'global');
  assert.equal(pickGrid({ regionRows: [], globalRows: rows(10), platformId: 'instagram' }).source, 'baseline');
  const base = baselineGrid('linkedin');
  assert.ok(gridTotal(base) > 0);
  assert.ok(base[1][9].posts > base[0][9].posts, 'LinkedIn baseline favours weekday mornings');
  assert.equal(formatHour(0), '12 AM');
  assert.equal(formatHour(13), '1 PM');
});

test('best-time pages: every platform × weekday × country, with copy that names the slot', () => {
  const pages = allBestTimePages();
  assert.equal(pages.length, 10 * (1 + 7 + 24));
  assert.deepEqual(parseSegment('monday'), { kind: 'weekday', weekday: 1 });
  assert.equal(parseSegment('in-india')?.kind, 'country');
  assert.equal(parseSegment('in-nowhere'), null);
  const s = scoreGrid(baselineGrid('instagram'));
  const best = topSlots(s, 5);
  const copy = pageCopy({ platform: 'instagram', segment: 'in-india', best, bestDay: bestWeekday(s), source: 'baseline', posts: 0 });
  assert.match(copy!.title, /^Best Time to Post on Instagram in India \(\d{4}\): \w+ at \d+ [AP]M$/);
  assert.match(copy!.description, /local time/);
  assert.ok(pageFaq({ platform: 'instagram', segment: '' }).length >= 4);
  assert.equal(siblingLinks('instagram', 'monday').days[1].current, true);
  assert.equal(pageCopy({ platform: 'nope', segment: '', best, bestDay: 0, source: 'baseline', posts: 0 }), null);
});

test('specs: unique slugs per platform, every spec has an answer and rows', () => {
  for (const p of SPEC_PLATFORMS) {
    const slugs = p.specs.map((s) => s.slug);
    assert.equal(new Set(slugs).size, slugs.length, `${p.slug} duplicate spec slugs`);
    for (const s of p.specs) {
      assert.ok(s.answer && s.detail && s.rows.length >= 1, `${p.slug}/${s.slug}`);
      assert.ok(['image', 'video', 'text', 'media'].includes(s.kind));
    }
  }
  assert.equal(specBySlug('x', 'post-character-limit')!.answer, '280 characters');
  assert.ok(allSpecPages().length >= 50);
});

test('post ideas: every template placeholder is filled for every industry', () => {
  for (const ind of INDUSTRIES) {
    for (const t of TEMPLATES) assert.doesNotMatch(fill(t.text, ind), /\{\w+\}/, `${ind.slug}: ${t.text}`);
    assert.equal(ideasFor(ind).length, TEMPLATES.length);
  }
  const day = ideasForDay(INDUSTRIES[0], 'tuesday');
  assert.equal(day.angle.hook, 'Tip Tuesday');
  assert.ok(day.angle.types.includes(day.ideas[0].type), 'weekday types come first');
  assert.equal(allPostIdeaPages().length, INDUSTRIES.length * 8);
});

test('anonymous cap keys change with visitor, tool and day and never contain the IP', () => {
  const req = (ip: string, ua = 'Mozilla/5.0') => new Request('https://scheduleforyou.com/api/public/best-time', { headers: { 'x-forwarded-for': `${ip}, 10.0.0.1`, 'user-agent': ua } });
  const a = anonKey(req('203.0.113.5'), 'best-time', '2026-11-01');
  assert.equal(a.length, 64);
  assert.doesNotMatch(a, /203/);
  assert.notEqual(a, anonKey(req('203.0.113.6'), 'best-time', '2026-11-01'));
  assert.notEqual(a, anonKey(req('203.0.113.5'), 'captions', '2026-11-01'));
  assert.notEqual(a, anonKey(req('203.0.113.5'), 'best-time', '2026-11-02'));
  assert.equal(a, anonKey(req('203.0.113.5'), 'best-time', '2026-11-01'));
  assert.match(utcDay(Date.UTC(2026, 10, 1, 23, 59)), /^2026-11-01$/);
  assert.equal(nextUtcMidnight(Date.UTC(2026, 10, 1, 23, 59)), Date.UTC(2026, 10, 2));
});
