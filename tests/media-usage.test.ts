import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COOLDOWN_OPTIONS, DEFAULT_COOLDOWN_DAYS, matchesUsage, mediaState, summarizeUsage, usageFilterOptions } from '../lib/media-usage.js';

const DAY = 86400000;
const NOW = Date.UTC(2026, 9, 25, 12);
const LABELS = { x: 'X', instagram: 'Instagram', linkedin: 'LinkedIn', bluesky: 'Bluesky' };

test('post rows fold into per-file counts by platform; failed targets and drafts count apart', () => {
  const u = summarizeUsage([
    // One post, two targets: Instagram published, X failed.
    { id: 'm1', post_id: 'p1', platform: 'instagram', target_status: 'published', post_status: 'published', at: NOW - 40 * DAY },
    { id: 'm1', post_id: 'p1', platform: 'x', target_status: 'failed', post_status: 'partial', at: NOW - 40 * DAY },
    // A later post to Instagram again, still in the queue.
    { id: 'm1', post_id: 'p2', platform: 'instagram', target_status: 'pending', post_status: 'scheduled', at: NOW + 2 * DAY },
    // A draft that includes the same file.
    { id: 'm1', post_id: 'p3', platform: 'linkedin', target_status: 'pending', post_status: 'draft', at: null },
    // Another file, posted to X twice; the newer time wins as "last".
    { id: 'm2', post_id: 'p4', platform: 'x', target_status: 'published', post_status: 'published', at: NOW - 100 * DAY },
    { id: 'm2', post_id: 'p5', platform: 'x', target_status: 'published', post_status: 'published', at: String(NOW - 5 * DAY) },
    // A post with no targets at all still counts as a post.
    { id: 'm3', post_id: 'p6', platform: null, target_status: null, post_status: 'scheduled', at: NOW + DAY },
  ]);
  assert.deepEqual(u.m1, { posts: 2, drafts: 1, last: NOW - 40 * DAY, platforms: { instagram: { published: 1, scheduled: 1, last: NOW - 40 * DAY }, x: { published: 0, scheduled: 0, last: null } } });
  assert.deepEqual(u.m2, { posts: 2, drafts: 0, last: NOW - 5 * DAY, platforms: { x: { published: 2, scheduled: 0, last: NOW - 5 * DAY } } });
  assert.deepEqual(u.m3, { posts: 1, drafts: 0, last: null, platforms: {} });
  assert.deepEqual(summarizeUsage([]), {});
});

test('a file is unused, used recently or rested, and knows which platforms never had it', () => {
  const platforms = ['instagram', 'x', 'linkedin'];
  const opts = { cooldownDays: 30, platforms, labels: LABELS, now: NOW };

  const fresh = mediaState(null, opts);
  assert.equal(fresh.state, 'unused');
  assert.equal(fresh.line, 'Never used');
  assert.deepEqual(fresh.unusedOn, platforms);
  assert.match(fresh.long, /Fresh for Instagram, X and LinkedIn/);

  const drafted = mediaState({ posts: 0, drafts: 2, last: null, platforms: {} }, opts);
  assert.equal(drafted.state, 'unused');
  assert.equal(drafted.line, 'Never posted · in 2 drafts');

  const recent = mediaState({ posts: 1, drafts: 0, last: NOW - 5 * DAY, platforms: { instagram: { published: 1, scheduled: 0, last: NOW - 5 * DAY } } }, opts);
  assert.equal(recent.state, 'recent');
  assert.equal(recent.line, 'Instagram ×1 · 5d ago');
  assert.deepEqual(recent.unusedOn, ['x', 'linkedin']);
  assert.match(recent.long, /^Posted to Instagram once \(last Oct 20\)\. Not yet used on X and LinkedIn\. Used recently: your 30-day cooldown ends Nov 19\.$/);

  const rested = mediaState({ posts: 3, drafts: 0, last: NOW - 95 * DAY, platforms: { instagram: { published: 2, scheduled: 0, last: NOW - 95 * DAY }, x: { published: 1, scheduled: 0, last: NOW - 120 * DAY } } }, opts);
  assert.equal(rested.state, 'rested');
  assert.equal(rested.line, 'Instagram ×2 · X ×1 · 3mo ago');
  assert.deepEqual(rested.unusedOn, ['linkedin']);
  assert.match(rested.long, /Posted to Instagram twice \(last Jul 22\) and X once \(last Jun 27\)\. Not yet used on LinkedIn\. Rested long enough to reuse\./);

  // Scheduled but not out yet counts as in use, not as fresh.
  const queued = mediaState({ posts: 1, drafts: 0, last: null, platforms: { x: { published: 0, scheduled: 1, last: null } } }, opts);
  assert.equal(queued.state, 'recent');
  assert.equal(queued.line, 'Scheduled · X');
  assert.deepEqual(queued.unusedOn, platforms);

  // Cooldown off: anything posted is ready again.
  const off = mediaState({ posts: 1, drafts: 0, last: NOW - DAY, platforms: { x: { published: 1, scheduled: 0, last: NOW - DAY } } }, { ...opts, cooldownDays: 0 });
  assert.equal(off.state, 'rested');
  assert.equal(off.line, 'X ×1 · yesterday');
  assert.match(off.long, /Ready to reuse\.$/);
});

test('the usage filter matches states and never-used-on platforms', () => {
  const items = [
    { id: 'a', state: 'unused', unusedOn: ['x', 'instagram'] },
    { id: 'b', state: 'recent', unusedOn: ['x'] },
    { id: 'c', state: 'rested', unusedOn: [] },
    { id: 'd' }, // older item without usage fields reads as unused
  ];
  const ids = (f: string) => items.filter((m) => matchesUsage(m, f)).map((m) => m.id);
  assert.deepEqual(ids(''), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids('unused'), ['a', 'd']);
  assert.deepEqual(ids('recent'), ['b']);
  assert.deepEqual(ids('rested'), ['c']);
  assert.deepEqual(ids('no:x'), ['a', 'b']);
  assert.deepEqual(ids('no:instagram'), ['a']);
  const opts = usageFilterOptions(['x', 'bluesky'], LABELS);
  assert.deepEqual(opts.map((o) => o.value), ['', 'unused', 'rested', 'recent', 'no:x', 'no:bluesky']);
  assert.equal(opts[5].label, 'Unused on Bluesky');
  assert.equal(DEFAULT_COOLDOWN_DAYS, 30);
  assert.ok(COOLDOWN_OPTIONS.some(([d]) => d === DEFAULT_COOLDOWN_DAYS));
  assert.equal(COOLDOWN_OPTIONS[0][0], 0);
});
