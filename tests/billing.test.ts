import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessFor, accountLimitOf, isPaid, planForPrice, requirePaid } from '../lib/server/billing.ts';
import { FREE_PLAN } from '../lib/plan-limits.js';

const withStripe = (fn: () => void) => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  try { fn(); } finally { delete process.env.STRIPE_SECRET_KEY; }
};

test('without Stripe configured nothing is limited', () => {
  delete process.env.STRIPE_SECRET_KEY;
  const ws = { plan: 'free', subscription_status: null, account_limit: 3 };
  const a = accessFor(ws);
  assert.equal(a.paid, true);
  assert.equal(a.canPublish, true);
  assert.equal(a.canInvite, true);
  assert.equal(accountLimitOf(ws), 15);
  assert.doesNotThrow(() => requirePaid(ws, 'api'));
});

test('a workspace without a paid plan is on Free: it publishes, with Free limits and no paid features', () => withStripe(() => {
  const fresh = accessFor({ plan: 'trial', subscription_status: null, trial_used: false, account_limit: 15 });
  assert.equal(fresh.state, 'free');
  assert.equal(fresh.paid, false);
  assert.equal(fresh.canPublish, true);
  assert.equal(fresh.canInvite, false);
  assert.equal(fresh.trialEligible, true);
  assert.equal(fresh.ended, false);
  // The stored limit doesn't matter on Free (an old row may still say 15).
  assert.equal(accountLimitOf({ subscription_status: null, account_limit: 15 }), FREE_PLAN.accountLimit);

  const ended = accessFor({ plan: 'none', subscription_status: 'canceled', stripe_subscription_id: 'sub_1', trial_used: true });
  assert.equal(ended.state, 'free');
  assert.equal(ended.ended, true);
  assert.equal(ended.trialEligible, false);

  assert.throws(() => requirePaid({ subscription_status: null }, 'webhooks'), (e: any) => e.status === 402 && /Webhooks are part of the paid plans/.test(e.message));
}));

test('paid states publish with every feature; only Studio can invite; past_due keeps working', () => withStripe(() => {
  const solo = accessFor({ plan: 'solo', subscription_status: 'active' });
  assert.equal(solo.paid, true);
  assert.equal(solo.canInvite, false);
  assert.equal(accountLimitOf({ plan: 'solo', subscription_status: 'active', account_limit: 15 }), 15);
  const studio = accessFor({ plan: 'studio', subscription_status: 'past_due' });
  assert.equal(studio.state, 'past_due');
  assert.equal(studio.canInvite, true);
  const trial = accessFor({ plan: 'studio', subscription_status: 'trialing', trial_ends_at: Date.now() + 3.5 * 86400000 });
  assert.equal(trial.state, 'trial');
  assert.equal(trial.daysLeft, 4);
  assert.equal(isPaid({ subscription_status: 'trialing' }), true);
  assert.equal(isPaid({ subscription_status: 'comped' }), true);
  assert.doesNotThrow(() => requirePaid({ subscription_status: 'active' }, 'api'));
}));

test('price ids map to plans, unknown prices to null', () => {
  process.env.STRIPE_PRICE_SOLO = 'price_solo';
  try {
    assert.equal(planForPrice('price_solo'), 'solo');
    assert.equal(planForPrice('price_other'), null);
    assert.equal(planForPrice(undefined), null);
  } finally {
    delete process.env.STRIPE_PRICE_SOLO;
  }
});

test('yearly prices map to the same plans and are 10 months of the monthly price', async () => {
  const { PLANS, intervalForPrice, priceFor } = await import('../lib/server/billing.ts');
  for (const p of Object.values(PLANS)) {
    assert.equal(planForPrice(p.yearlyPrice()), p.id);
    assert.equal(intervalForPrice(p.yearlyPrice()), 'year');
    assert.equal(intervalForPrice(p.price()), 'month');
    assert.equal(priceFor(p.id, 'year'), p.yearlyPrice());
    assert.equal(priceFor(p.id), p.price());
    assert.equal(p.yearlyAmount, p.amount * 10);
  }
  assert.equal(intervalForPrice('price_someone_else'), null);
});
