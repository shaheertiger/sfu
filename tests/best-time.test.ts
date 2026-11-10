import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baselineGrid, bestWeekday, countryOfTimezone, formatHour, gridFromRows, gridTotal, pickGrid, scoreGrid, topHoursOfDay, topSlots, MIN_POSTS_GLOBAL, MIN_POSTS_REGION } from '../lib/best-time.js';
import { allBestTimePages, pageCopy, pageFaq, parseSegment, siblingLinks, socialCopy, socialFaq } from '../lib/best-time-pages.js';
import { COUNTRIES, combineScores, quietSlots } from '../lib/best-time.js';
import { TRENDS_META, staticGrid, trendsCountries, trendsGlobalGrid, trendsGrid } from '../lib/best-time-trends.js';
import { STUDIES, studiesFor } from '../lib/best-time-countries.js';
import { REGIONS, convertSlot, countryLocal, dstInfo, formatOffset, nearbyCountries, offsetMinutes } from '../lib/best-time-countries.js';
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
  assert.equal(pages.length, 10 * (1 + 7 + COUNTRIES.length) + COUNTRIES.length);
  assert.ok(pages.some((p) => p.platform === 'social-media' && p.segment === 'in-singapore'));
  assert.deepEqual(parseSegment('monday'), { kind: 'weekday', weekday: 1 });
  assert.equal(parseSegment('in-india')?.kind, 'country');
  assert.equal(parseSegment('in-nowhere'), null);
  const s = scoreGrid(baselineGrid('instagram'));
  const best = topSlots(s, 5);
  const copy = pageCopy({ platform: 'instagram', segment: 'in-india', best, bestDay: bestWeekday(s), source: 'baseline', posts: 0 });
  assert.match(copy!.title, /^Best Time to Post on Instagram in India \(\d{4}\): [A-Z][a-z]{2} \d+ [AP]M IST$/);
  assert.match(copy!.description, /India time \(UTC\+5:30\)/);
  assert.match(copy!.answer, /^The best time to post on Instagram in India is \w+ at \d+ [AP]M \(\d\d:00\) IST\.$/);
  const faq = pageFaq({ platform: 'instagram', segment: 'in-india', best, bestDay: bestWeekday(s), quiet: quietSlots(s, 3) });
  assert.ok(faq.length >= 8, 'country pages get country questions on top of the general ones');
  assert.ok(faq.some((f) => /time zone/.test(f.q) && /UTC\+5:30 all year/.test(f.a)));
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

test('every country page has local facts, a region and working time zones', () => {
  const inRegions = REGIONS.flatMap((r) => r.countries);
  assert.equal(new Set(inRegions).size, inRegions.length, 'a country is in two regions');
  for (const c of COUNTRIES) {
    const l = countryLocal(c.slug);
    assert.ok(l, `${c.slug}: no local facts in lib/best-time-countries.js`);
    assert.ok(inRegions.includes(c.slug), `${c.slug}: no region`);
    assert.ok(l!.cities.length >= 5 && l!.rhythm.length > 80 && l!.tips.length >= 2, c.slug);
    assert.equal(l!.zones[0][1], c.tz, `${c.slug}: first zone must be the page's time zone`);
    for (const [, tz] of l!.zones) assert.doesNotThrow(() => offsetMinutes(tz), `${c.slug}: ${tz}`);
    assert.equal(nearbyCountries(c.slug, 4).length, 4);
  }
});

test('time zone helpers: offsets, daylight saving and slot conversion', () => {
  const jan = Date.UTC(2026, 0, 15);
  const jul = Date.UTC(2026, 6, 15);
  assert.equal(offsetMinutes('Asia/Kolkata', jan), 330);
  assert.equal(offsetMinutes('America/New_York', jan), -300);
  assert.equal(offsetMinutes('America/New_York', jul), -240);
  assert.equal(formatOffset(330), 'UTC+5:30');
  assert.equal(formatOffset(-180), 'UTC−3');
  assert.deepEqual(dstInfo('Europe/Rome', 2026), { observes: true, standard: 60, daylight: 120 });
  assert.equal(dstInfo('Asia/Singapore', 2026).observes, false);
  // Tuesday 9 PM in Singapore is Tuesday 1 PM UTC and Tuesday 6:30 PM in India.
  assert.deepEqual(convertSlot({ weekday: 2, hour: 21 }, 'Asia/Singapore', 'UTC', jan), { weekday: 2, hour: 13, minute: 0 });
  assert.deepEqual(convertSlot({ weekday: 2, hour: 21 }, 'Asia/Singapore', 'Asia/Kolkata', jan), { weekday: 2, hour: 18, minute: 30 });
  // Monday 8 AM in Auckland (summer, UTC+13) is still Sunday in New York.
  assert.equal(convertSlot({ weekday: 1, hour: 8 }, 'Pacific/Auckland', 'America/New_York', jan).weekday, 0);
});

test('social media country pages combine every platform and answer in local time', () => {
  const grids = ['instagram', 'linkedin', 'tiktok'].map((id) => scoreGrid(baselineGrid(id)));
  const combined = combineScores(grids);
  assert.equal(Math.max(...combined.flat()), 100);
  const best = topSlots(combined, 5);
  const copy = socialCopy({ country: 'singapore', best, bestDay: bestWeekday(combined) });
  // The local time zone is shown when it fits; the year (a data page) wins when there's room for only one.
  assert.match(copy!.title, /^Best Time to Post on Social Media in Singapore \(\d{4}\): [A-Z][a-z]{2} \d+ [AP]M( SGT)?$/);
  assert.ok(copy!.title.length <= 65, copy!.title);
  assert.match(copy!.h1, /^Best Time to Post on Social Media in Singapore/);
  assert.equal(copy!.keyword, 'best time to post on social media in singapore');
  const perPlatform = ['instagram', 'tiktok', 'linkedin'].map((id, i) => ({ platform: { id, name: id }, best: topSlots(grids[i], 1)[0] }));
  const faq = socialFaq({ country: 'singapore', best, bestDay: bestWeekday(combined), perPlatform, scores: combined });
  assert.ok(faq.length >= 6);
  assert.ok(faq.every((f) => f.a && !/undefined|NaN/.test(f.a)), 'no holes in the answers');
  assert.equal(socialCopy({ country: 'atlantis', best, bestDay: 0 }), null);
});

test('Google Trends grids slot in after our own country data and before our worldwide data', () => {
  const rows = (n: number) => [{ weekday: 1, hour: 9, posts: n, clicks: 0 }];
  const trends = { grid: baselineGrid('tiktok'), kind: 'platform' };
  assert.equal(pickGrid({ regionRows: rows(MIN_POSTS_REGION), globalRows: rows(MIN_POSTS_GLOBAL), platformId: 'tiktok', trends }).source, 'region');
  const t = pickGrid({ regionRows: rows(10), globalRows: rows(MIN_POSTS_GLOBAL), platformId: 'tiktok', trends });
  assert.equal(t.source, 'trends');
  assert.equal(t.trendsKind, 'platform');
  assert.equal(pickGrid({ regionRows: rows(10), globalRows: rows(MIN_POSTS_GLOBAL), platformId: 'tiktok', trends: null }).source, 'global');
});

test('Trends data: every country that has it gets readable 7×24 grids in local time', () => {
  assert.match(TRENDS_META.fetchedAt, /^\d{4}-\d{2}-\d{2}$/);
  const covered = trendsCountries();
  assert.ok(covered.length >= 6, 'Trends data missing: run scripts/fetch-best-time-trends.mjs');
  for (const code of covered) assert.ok(COUNTRIES.some((c) => c.code === code), `${code} is not a country page`);
  for (const c of COUNTRIES.filter((x) => covered.includes(x.code))) {
    for (const p of ['instagram', 'tiktok', 'facebook', 'linkedin', 'x', 'threads', 'youtube', 'pinterest', 'bluesky', 'google']) {
      const t = trendsGrid(p, c.code);
      assert.ok(t, `${c.code} ${p}: no grid and no country average`);
      const flat = t!.grid.flat().map((x: { posts: number }) => x.posts / 10);
      assert.equal(flat.length, 168);
      assert.equal(Math.max(...flat), 100, `${c.code} ${p}: not scaled to 100`);
      // People sleep: 3–5 AM local should never be the best slot of the week.
      const best = topSlots(scoreGrid(t!.grid), 1)[0];
      assert.ok(best.hour < 3 || best.hour > 5, `${c.code} ${p}: best slot at ${best.hour}:00`);
    }
  }
  assert.ok(trendsGlobalGrid('instagram'));
  assert.equal(staticGrid('instagram', covered[0]).source, 'trends');
  const missing = COUNTRIES.find((c) => !covered.includes(c.code));
  if (missing) assert.equal(trendsGrid('instagram', missing.code), null, 'countries without Trends data fall back to our data or the baseline');
});

test('countries without direct Trends data use their own Wikipedia traffic, labelled as such', () => {
  const de = trendsGrid('instagram', 'DE');
  if (!de) return; // data file not rebuilt yet
  assert.equal(de.kind, 'activity');
  const copy = pageCopy({ platform: 'instagram', segment: 'in-germany', best: topSlots(scoreGrid(de.grid), 5), bestDay: 0, source: 'trends', posts: 0, trendsKind: 'activity', fetchedAt: '2026-11-06', countryCount: 6 });
  assert.match(copy!.intro, /when people in Germany are online \(hourly traffic on Germany's local-language Wikipedia/);
  assert.equal(trendsGrid('instagram', 'US')!.kind, 'platform', 'directly measured countries keep their own Trends data');
});

test('independent studies: real country pages, https sources, a finding and a window for every one', () => {
  for (const [slug, list] of Object.entries(STUDIES)) {
    assert.ok(countryLocal(slug), `${slug} is not a country page`);
    for (const st of list) {
      assert.match(st.url, /^https:\/\//);
      assert.ok(st.findings.all && st.windows.all.length, `${slug}: needs an overall finding and window`);
      for (const k of Object.keys(st.findings)) assert.ok(st.windows[k as keyof typeof st.windows], `${slug} ${k}: finding without a window`);
    }
  }
  const br = studiesFor('brazil', 'instagram')[0];
  assert.equal(br.platformSpecific, true);
  assert.deepEqual(br.window, [[18, 22]]);
  assert.equal(studiesFor('brazil', 'pinterest')[0].platformSpecific, false, 'platforms the study does not cover use its overall finding');
  assert.deepEqual(studiesFor('kenya'), []);
});
