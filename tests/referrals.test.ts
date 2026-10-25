import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attributeSignup, CODE_RE, creditCentsFor, newCode, normalizeCode, readRefCookie, referralCode, referralSummary, rewardReferrer, shareText } from '../lib/server/referrals.ts';
import { REFERRED_TRIAL_DAYS, TRIAL_DAYS, trialDaysFor } from '../lib/server/billing.ts';

/** A tiny in-memory workspaces table that answers the SQL referrals.ts sends. */
function fakeDb(workspaces: any[], users: any[] = []) {
  const stripeCalls: any[] = [];
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    const row = (id: string) => workspaces.find((w) => w.id === id);
    if (sql.startsWith('SELECT referral_code FROM workspaces')) return { rows: [row(p[0])].filter(Boolean).map((w) => ({ referral_code: w.referral_code ?? null })), rowCount: 0 };
    if (sql.startsWith('UPDATE workspaces SET referral_code=')) {
      const w = row(p[1]);
      if (!w || w.referral_code) return { rows: [], rowCount: 0 };
      if (workspaces.some((x) => x.referral_code === p[0])) throw new Error('duplicate key value violates unique constraint');
      w.referral_code = p[0];
      return { rows: [], rowCount: 1 };
    }
    if (sql.startsWith('SELECT id, owner_id FROM workspaces WHERE referral_code')) return { rows: workspaces.filter((w) => w.referral_code === p[0]).map(({ id, owner_id }) => ({ id, owner_id })), rowCount: 0 };
    if (sql.startsWith('UPDATE workspaces SET referred_by=')) {
      const w = row(p[1]);
      if (!w || w.owner_id !== p[2] || w.referred_by || w.id === p[0]) return { rows: [], rowCount: 0 };
      w.referred_by = p[0];
      return { rows: [], rowCount: 1 };
    }
    if (sql.startsWith('UPDATE workspaces SET referral_rewarded_at=$1')) {
      const w = row(p[1]);
      if (!w || !w.referred_by || w.referral_rewarded_at) return { rows: [], rowCount: 0 };
      w.referral_rewarded_at = p[0];
      return { rows: [{ referred_by: w.referred_by }], rowCount: 1 };
    }
    if (sql.startsWith('UPDATE workspaces SET referral_rewarded_at=NULL')) {
      const w = row(p[0]);
      if (w && w.referral_rewarded_at === p[1]) w.referral_rewarded_at = null;
      return { rows: [], rowCount: 1 };
    }
    if (sql.startsWith('SELECT w.id, w.plan, w.stripe_customer_id, u.email, u.name FROM workspaces w JOIN users u')) {
      const w = row(p[0]);
      const u = w && users.find((x) => x.id === w.owner_id);
      return { rows: w && u ? [{ id: w.id, plan: w.plan, stripe_customer_id: w.stripe_customer_id ?? null, email: u.email, name: u.name }] : [], rowCount: 0 };
    }
    if (sql.startsWith('UPDATE workspaces SET stripe_customer_id=COALESCE')) { const w = row(p[1]); if (w) w.stripe_customer_id ||= p[0]; return { rows: [], rowCount: 1 }; }
    if (sql.startsWith('SELECT stripe_customer_id FROM workspaces')) return { rows: [{ stripe_customer_id: row(p[0])?.stripe_customer_id ?? null }], rowCount: 0 };
    if (sql.startsWith('SELECT COUNT(*)::int AS signups')) {
      const mine = workspaces.filter((w) => w.referred_by === p[0]);
      return { rows: [{ signups: mine.length, rewarded: mine.filter((w) => w.referral_rewarded_at).length }], rowCount: 0 };
    }
    throw new Error('unexpected: ' + sql.slice(0, 80));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  const stripe = {
    customers: {
      create: async (args: any) => { stripeCalls.push(['create', args]); return { id: 'cus_new' }; },
      createBalanceTransaction: async (customer: string, args: any) => { stripeCalls.push(['credit', customer, args]); return { id: 'cbtxn_1' }; },
    },
  } as any;
  return { stripe, stripeCalls };
}

test('codes are short, lowercase and unambiguous; cookies and odd input are normalised', () => {
  for (let i = 0; i < 50; i++) {
    const c = newCode();
    assert.match(c, CODE_RE);
    assert.doesNotMatch(c, /[01oli]/);
  }
  assert.equal(normalizeCode(' K7MVQ2XD '), 'k7mvq2xd');
  assert.equal(normalizeCode('too-long-and-odd!'), null);
  assert.equal(normalizeCode(''), null);
  assert.equal(readRefCookie('neon-auth.session_token=abc; sfy_ref=k7mvq2xd; other=1'), 'k7mvq2xd');
  assert.equal(readRefCookie('sfy_ref=%3Cscript%3E'), null);
  assert.equal(readRefCookie(null), null);
});

test('a referral link is made once per workspace and differs between workspaces', async () => {
  const ws = [{ id: 'a', owner_id: 'u1', referral_code: null }, { id: 'b', owner_id: 'u2', referral_code: null }];
  fakeDb(ws);
  const first = await referralCode('a');
  assert.match(first, CODE_RE);
  assert.equal(await referralCode('a'), first);
  assert.equal(ws[0].referral_code, first);
  assert.notEqual(await referralCode('b'), first);
});

test('sign-ups are attributed once, never to your own workspaces, and unknown codes do nothing', async () => {
  const ws = [
    { id: 'sender', owner_id: 'u1', referral_code: 'k7mvq2xd' },
    { id: 'fresh', owner_id: 'u2', referral_code: null, referred_by: null },
    { id: 'mine', owner_id: 'u1', referral_code: null, referred_by: null },
  ];
  fakeDb(ws);
  assert.equal(await attributeSignup('fresh', 'u2', 'nope1234'), null);
  assert.equal(await attributeSignup('mine', 'u1', 'k7mvq2xd'), null, 'own link');
  assert.equal(await attributeSignup('fresh', 'u2', 'K7MVQ2XD'), 'sender');
  assert.equal(ws[1].referred_by, 'sender');
  assert.equal(await attributeSignup('fresh', 'u2', 'k7mvq2xd'), null, 'already attributed');
  assert.equal(trialDaysFor(ws[1]), REFERRED_TRIAL_DAYS);
  assert.equal(trialDaysFor(ws[0]), TRIAL_DAYS);
  assert.equal(trialDaysFor(null), TRIAL_DAYS);
});

test('the sender is credited a month of their plan exactly once, with a Stripe customer made if needed', async () => {
  const ws = [
    { id: 'sender', owner_id: 'u1', plan: 'studio', referral_code: 'k7mvq2xd', stripe_customer_id: null },
    { id: 'fresh', owner_id: 'u2', plan: 'solo', referred_by: 'sender', referral_rewarded_at: null },
    { id: 'organic', owner_id: 'u3', plan: 'solo', referred_by: null },
  ];
  const { stripe, stripeCalls } = fakeDb(ws, [{ id: 'u1', email: 'ana@example.com', name: 'Ana' }]);
  assert.equal(await rewardReferrer('organic', stripe), null);
  const paid = await rewardReferrer('fresh', stripe);
  assert.deepEqual(paid, { referrer: 'sender', cents: 5900 });
  assert.equal(stripeCalls[0][0], 'create');
  assert.equal(stripeCalls[0][1].email, 'ana@example.com');
  assert.equal(stripeCalls[1][0], 'credit');
  assert.equal(stripeCalls[1][1], 'cus_new');
  assert.equal(stripeCalls[1][2].amount, -5900);
  assert.equal(ws[0].stripe_customer_id, 'cus_new');
  // A replayed webhook, or the next renewal, pays nothing more.
  assert.equal(await rewardReferrer('fresh', stripe), null);
  assert.equal(stripeCalls.length, 2);
  assert.equal(creditCentsFor('none'), 1900);
  assert.equal(creditCentsFor(undefined), 1900);
});

test('a Stripe failure releases the claim so the webhook retry can pay', async () => {
  const ws = [
    { id: 'sender', owner_id: 'u1', plan: 'solo', referral_code: 'k7mvq2xd', stripe_customer_id: 'cus_1' },
    { id: 'fresh', owner_id: 'u2', plan: 'solo', referred_by: 'sender', referral_rewarded_at: null },
  ];
  const { stripe } = fakeDb(ws, [{ id: 'u1', email: 'ana@example.com', name: 'Ana' }]);
  let fail = true;
  stripe.customers.createBalanceTransaction = async () => { if (fail) throw new Error('rate limited'); return { id: 'cbtxn_2' }; };
  await assert.rejects(rewardReferrer('fresh', stripe), /rate limited/);
  assert.equal(ws[1].referral_rewarded_at, null);
  fail = false;
  assert.deepEqual(await rewardReferrer('fresh', stripe), { referrer: 'sender', cents: 1900 });
  assert.ok(ws[1].referral_rewarded_at);
});

test('the summary carries the link, counts and a plain share message', async () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  try {
    const ws = [
      { id: 'sender', owner_id: 'u1', plan: 'solo', referral_code: 'k7mvq2xd' },
      { id: 'a', owner_id: 'u2', referred_by: 'sender', referral_rewarded_at: 1 },
      { id: 'b', owner_id: 'u3', referred_by: 'sender', referral_rewarded_at: null },
    ];
    fakeDb(ws);
    const sum = await referralSummary('sender', 'solo');
    assert.equal(sum.url, 'https://scheduleforyou.com/r/k7mvq2xd');
    assert.equal(sum.signups, 2);
    assert.equal(sum.rewarded, 1);
    assert.equal(sum.credit_cents, 1900);
    assert.equal(sum.trial_days, 14);
    assert.equal(sum.share_text, shareText(sum.url));
    assert.match(sum.share_text, /14-day free trial: https:\/\/scheduleforyou\.com\/r\/k7mvq2xd$/);
    assert.doesNotMatch(sum.share_text, /AI/);
  } finally {
    delete process.env.APP_URL;
  }
});
