import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fillDays, getAdminStats, isAuthorized, parseDays, type Query } from '../lib/server/admin-stats.ts';

const NOW = Date.parse('2026-11-10T17:00:00.000Z');

test('isAuthorized needs the exact bearer secret', () => {
  assert.equal(isAuthorized('Bearer s3cret', 's3cret'), true);
  assert.equal(isAuthorized('Bearer wrong', 's3cret'), false);
  assert.equal(isAuthorized('s3cret', 's3cret'), false);
  assert.equal(isAuthorized(null, 's3cret'), false);
  assert.equal(isAuthorized('Bearer ', ''), false);
  assert.equal(isAuthorized('Bearer undefined', undefined), false);
});

test('parseDays defaults to 14 and clamps to 1–90', () => {
  assert.equal(parseDays(null), 14);
  assert.equal(parseDays('abc'), 14);
  assert.equal(parseDays('0'), 1);
  assert.equal(parseDays('30'), 30);
  assert.equal(parseDays('500'), 90);
});

test('fillDays returns one entry per day ending today, zero-filled', () => {
  const out = fillDays([{ day: '2026-11-10', n: 2 }, { day: '2026-11-08', n: 1 }], NOW, 3);
  assert.deepEqual(out, [
    { date: '2026-11-08', count: 1 },
    { date: '2026-11-09', count: 0 },
    { date: '2026-11-10', count: 2 },
  ]);
});

test('getAdminStats shapes counts from the queries and returns no personal data', async () => {
  const q: Query = async (text: string) => {
    if (text.includes('FROM users GROUP') || text.includes('FROM users WHERE')) return [{ day: '2026-11-10', n: 3 }] as any;
    if (text.includes('FROM users')) return [{ total: 42, d1: 3, d7: 5, d30: 12, latest: NOW - 1000 }] as any;
    if (text.includes('plan AS k')) return [{ k: 'free', n: 30 }, { k: 'solo', n: 5 }] as any;
    if (text.includes('subscription_status AS k')) return [{ k: null, n: 30 }, { k: 'active', n: 5 }] as any;
    if (text.includes('social_accounts')) return [{ n: 17 }] as any;
    if (text.includes('FROM posts')) return [{ total: 100, d7: 9 }] as any;
    throw new Error(`unexpected query: ${text}`);
  };
  const s = await getAdminStats(q, NOW, 2);
  assert.deepEqual(s.users, { total: 42, last24h: 3, last7d: 5, last30d: 12, latestSignupAt: new Date(NOW - 1000).toISOString() });
  assert.deepEqual(s.signupsByDay, [{ date: '2026-11-09', count: 0 }, { date: '2026-11-10', count: 3 }]);
  assert.deepEqual(s.workspaces, { total: 35, byPlan: { free: 30, solo: 5 }, bySubscriptionStatus: { none: 30, active: 5 } });
  assert.equal(s.socialAccounts, 17);
  assert.deepEqual(s.posts, { total: 100, last7d: 9 });
  assert.doesNotMatch(JSON.stringify(s), /@/);
});
