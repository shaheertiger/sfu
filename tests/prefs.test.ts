import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanPrefs } from '../lib/server/prefs.ts';

test('over-long labels, notes and templates are shortened, so pausing the queue still saves', () => {
  const { prefs, skipped } = cleanPrefs({
    paused: true,
    labels: ['ok', 'x'.repeat(300)],
    templates: [{ name: 'n'.repeat(100), text: 't'.repeat(9000) }],
    tagGroups: [{ name: 'g', tags: '#a '.repeat(1000) }],
    notes: { '2026-10-23': 'z'.repeat(800), ['k'.repeat(50)]: 'dropped' },
    folders: Array.from({ length: 150 }, (_, i) => `f${i}`),
  });
  assert.deepEqual(skipped, []);
  assert.equal(prefs.paused, true);
  assert.deepEqual(prefs.labels!.map((l) => l.length), [2, 40]);
  assert.equal(prefs.templates![0].name.length, 60);
  assert.equal(prefs.templates![0].text.length, 5000);
  assert.equal(prefs.tagGroups![0].tags.length, 2000);
  assert.deepEqual(Object.keys(prefs.notes!), ['2026-10-23']);
  assert.equal(prefs.notes!['2026-10-23'].length, 500);
  assert.equal(prefs.folders!.length, 100);
});

test('a setting that can’t be read is skipped instead of refusing the others', () => {
  const { prefs, skipped } = cleanPrefs({ paused: false, tz: 'Not/AZone', slots: ['09:00', 'nine', '17:30'], slotDays: [1, 9, 2], remind: { on: true, lead: 99999 }, alerts: 'yes', unknown: 1 });
  assert.equal(prefs.paused, false);
  assert.deepEqual(prefs.slots, ['09:00', '17:30']);
  assert.deepEqual(prefs.slotDays, [1, 2]);
  assert.deepEqual(prefs.remind, { on: true, lead: 10080 });
  assert.deepEqual(skipped.sort(), ['alerts', 'tz']);
  assert.equal('unknown' in prefs, false);
  assert.deepEqual(cleanPrefs({ tz: 'Europe/Berlin', tzSet: true }).prefs, { tz: 'Europe/Berlin', tzSet: true });
  assert.deepEqual(cleanPrefs(null), { prefs: {}, skipped: [] });
});
