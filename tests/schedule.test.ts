import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localParts, nextOccurrence, occurrence, zonedToUtc } from '../lib/server/tz.ts';
import { PAST_GRACE_MS, pastScheduleProblem, repeatSeries } from '../lib/server/posts.ts';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

const NY = 'America/New_York';
const local = (tz: string, at: number) => {
  const l = localParts(tz, at);
  return `${l.y}-${String(l.mo + 1).padStart(2, '0')}-${String(l.d).padStart(2, '0')} ${String(l.h).padStart(2, '0')}:${String(l.mi).padStart(2, '0')}`;
};

test('weekly repeats keep the local time across a DST change', () => {
  const anchor = zonedToUtc(NY, 2026, 9, 26, 9, 0); // Mon Oct 26 2026, 09:00 EDT
  assert.equal(anchor, Date.UTC(2026, 9, 26, 13, 0));
  const next = occurrence(anchor, 1, 'weekly', NY); // Nov 2, after clocks went back
  assert.equal(local(NY, next), '2026-11-02 09:00');
  assert.equal(next, Date.UTC(2026, 10, 2, 14, 0));
  assert.equal(local(NY, occurrence(anchor, 20, 'weekly', NY)), '2027-03-15 09:00'); // after clocks went forward
});

test('monthly repeats keep the anchor’s day, clamped to short months, without drifting', () => {
  const anchor = Date.UTC(2026, 0, 31, 10, 0); // Jan 31
  const seq = [1, 2, 3, 13].map((n) => local('UTC', occurrence(anchor, n, 'monthly', 'UTC')));
  assert.deepEqual(seq, ['2026-02-28 10:00', '2026-03-31 10:00', '2026-04-30 10:00', '2027-02-28 10:00']);
  assert.equal(local('UTC', occurrence(Date.UTC(2027, 11, 31, 10), 2, 'monthly', 'UTC')), '2028-02-29 10:00');
  const berlin = zonedToUtc('Europe/Berlin', 2026, 1, 15, 8, 30); // Feb 15, CET
  assert.equal(local('Europe/Berlin', occurrence(berlin, 2, 'monthly', 'Europe/Berlin')), '2026-04-15 08:30'); // CEST
});

test('an unknown timezone falls back to UTC instead of throwing', () => {
  assert.equal(occurrence(Date.UTC(2026, 0, 1, 9), 1, 'weekly', 'Not/AZone'), Date.UTC(2026, 0, 8, 9));
});

test('the next occurrence skips missed ones and never repeats an occurrence published early', () => {
  const anchor = Date.UTC(2026, 0, 5, 9); // Monday
  // Paused for a month: the next copy goes out at the first occurrence after now.
  const after = Date.UTC(2026, 1, 10, 12);
  assert.deepEqual(nextOccurrence(anchor, 0, 'weekly', 'UTC', after), { at: Date.UTC(2026, 1, 16, 9), n: 6 });
  // Occurrence 2 (Jan 19) was published early on Jan 15: the next one is still Jan 26, not Jan 19.
  assert.deepEqual(nextOccurrence(anchor, 2, 'weekly', 'UTC', Date.UTC(2026, 0, 15)), { at: Date.UTC(2026, 0, 26, 9), n: 3 });
});

test('the series anchor survives edits, retries and publish now; a new time re-anchors it', () => {
  const existing = { repeat: 'weekly', scheduled_at: 1_000, repeat_anchor: 500, repeat_n: 3 };
  // Same time sent back (an edit of the caption): keep.
  assert.deepEqual(repeatSeries({ scheduled_at: 1_000 }, existing, 1_000), { anchor: 500, n: 3 });
  // Retry moved scheduled_at server-side; nothing sent: keep.
  assert.deepEqual(repeatSeries({}, { ...existing, scheduled_at: 9_000 }, 9_000), { anchor: 500, n: 3 });
  // Publish now: keep.
  assert.deepEqual(repeatSeries({ publish_now: true, scheduled_at: 7_000 }, existing, 7_000), { anchor: 500, n: 3 });
  // Dragged to another time: the series starts there.
  assert.deepEqual(repeatSeries({ scheduled_at: 2_000 }, existing, 2_000), { anchor: 2_000, n: 0 });
  // Switched from weekly to monthly: re-anchored.
  assert.deepEqual(repeatSeries({ repeat: 'monthly' }, existing, 1_000), { anchor: 1_000, n: 0 });
  // New repeating post: anchored at its time. Not repeating: no anchor.
  assert.deepEqual(repeatSeries({ repeat: 'monthly', scheduled_at: 4_000 }, null, 4_000), { anchor: 4_000, n: 0 });
  assert.deepEqual(repeatSeries({ repeat: 'none', scheduled_at: 4_000 }, existing, 4_000), { anchor: null, n: 0 });
});

test('a newly set time in the past is refused; publish now, drafts and due posts being retried are not', () => {
  const t = Date.UTC(2026, 9, 23, 12);
  const past = t - PAST_GRACE_MS - 1;
  assert.match(pastScheduleProblem('scheduled', past, null, false, t)!, /in the past/);
  assert.equal(pastScheduleProblem('scheduled', t - 60_000, null, false, t), null); // "now" from a slow browser
  assert.equal(pastScheduleProblem('scheduled', past, null, true, t), null); // publish_now
  assert.equal(pastScheduleProblem('draft', past, null, false, t), null);
  // A failed post edited with its old time is a retry.
  assert.equal(pastScheduleProblem('scheduled', past, { status: 'failed', scheduled_at: past }, false, t), null);
  // An overdue scheduled post (paused queue) can be edited.
  assert.equal(pastScheduleProblem('scheduled', past, { status: 'scheduled', scheduled_at: t - 3600_000 }, false, t), null);
  // A future post moved into the past, or a draft scheduled in the past, is refused.
  assert.match(pastScheduleProblem('scheduled', past, { status: 'scheduled', scheduled_at: t + 3600_000 }, false, t)!, /in the past/);
  assert.match(pastScheduleProblem('scheduled', past, { status: 'draft', scheduled_at: past }, false, t)!, /in the past/);
});

test('savePost answers 422 for a new post scheduled in the past, before writing anything', async () => {
  const { savePost } = await import('../lib/server/posts.ts');
  const seen: string[] = [];
  const run = async (text: string) => {
    seen.push(text.replace(/\s+/g, ' ').trim());
    return { rows: [], rowCount: 0 };
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  await assert.rejects(
    () => savePost('ws', { id: 'post_new', caption: 'Hi', status: 'scheduled', scheduled_at: Date.now() - 3600_000, targets: [{ account_id: 'acc_1' }] }, 'u1'),
    (e: any) => e.status === 422 && /in the past/.test(e.message),
  );
  assert.ok(!seen.some((s) => /^(INSERT|UPDATE|DELETE|BEGIN)/.test(s)), seen.join('\n'));
});
