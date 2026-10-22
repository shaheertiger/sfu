import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessFor, canPublishSql, planForPrice } from '../lib/server/billing.ts';

const withStripe = (fn: () => void) => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  try { fn(); } finally { delete process.env.STRIPE_SECRET_KEY; }
};

test('without Stripe configured nothing is blocked', () => {
  delete process.env.STRIPE_SECRET_KEY;
  const a = accessFor({ plan: 'trial', subscription_status: null });
  assert.equal(a.canPublish, true);
  assert.equal(a.canInvite, true);
  assert.equal(canPublishSql(), 'true');
});

test('a new workspace needs a card; an ended plan is expired', () => withStripe(() => {
  assert.equal(accessFor({ plan: 'trial', subscription_status: null, trial_used: false }).state, 'needs_card');
  const ended = accessFor({ plan: 'none', subscription_status: 'canceled', stripe_subscription_id: 'sub_1', trial_used: true });
  assert.equal(ended.state, 'expired');
  assert.equal(ended.canPublish, false);
  assert.equal(ended.trialEligible, false);
}));

test('paid states publish; only Studio can invite; past_due keeps working', () => withStripe(() => {
  const solo = accessFor({ plan: 'solo', subscription_status: 'active' });
  assert.equal(solo.canPublish, true);
  assert.equal(solo.canInvite, false);
  const studio = accessFor({ plan: 'studio', subscription_status: 'past_due' });
  assert.equal(studio.state, 'past_due');
  assert.equal(studio.canPublish, true);
  assert.equal(studio.canInvite, true);
  const trial = accessFor({ plan: 'studio', subscription_status: 'trialing', trial_ends_at: Date.now() + 3.5 * 86400000 });
  assert.equal(trial.state, 'trial');
  assert.equal(trial.daysLeft, 4);
  assert.match(canPublishSql(), /trialing/);
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
