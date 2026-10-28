import 'server-only';
import Stripe from 'stripe';
import { HttpError } from './http-error';
import { exec, now, one } from './db';
import { FREE_PLAN, paidOnlyMessage } from '@/lib/plan-limits';

/**
 * Stripe billing: one subscription per workspace.
 * STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET; optional STRIPE_PRICE_SOLO / STRIPE_PRICE_STUDIO and the
 * yearly STRIPE_PRICE_SOLO_YEARLY / STRIPE_PRICE_STUDIO_YEARLY (all default to the live prices created
 * for Schedule For You) and STRIPE_PORTAL_CONFIGURATION. Yearly costs 10 months: 2 months free.
 * The 7-day free trial (14 days from a referral link) needs a card: the owner starts it in Checkout and Stripe charges when it ends.
 * A workspace without a paid plan is on Free (lib/plan-limits.js): 3 accounts, 10 scheduled posts at a time,
 * and the paid-only features refused with a 402. Until STRIPE_SECRET_KEY is set, billing is off and nothing is limited.
 */
export const PLANS = {
  solo: {
    id: 'solo', name: 'Solo', amount: 19, yearlyAmount: 190, accountLimit: 15, team: false,
    price: () => process.env.STRIPE_PRICE_SOLO || 'price_1UTMrgPgKI4BZbGFEDOyBeTF',
    yearlyPrice: () => process.env.STRIPE_PRICE_SOLO_YEARLY || 'price_1UTnzePgKI4BZbGFITIQa8ur',
  },
  studio: {
    id: 'studio', name: 'Studio', amount: 59, yearlyAmount: 590, accountLimit: 100, team: true,
    price: () => process.env.STRIPE_PRICE_STUDIO || 'price_1UTMrhPgKI4BZbGF1pB8lYJf',
    yearlyPrice: () => process.env.STRIPE_PRICE_STUDIO_YEARLY || 'price_1UTnzgPgKI4BZbGFVdU7qA3k',
  },
} as const;
export type PlanId = keyof typeof PLANS;
export type Interval = 'month' | 'year';
export const priceFor = (plan: PlanId, interval: Interval = 'month') => (interval === 'year' ? PLANS[plan].yearlyPrice() : PLANS[plan].price());
const DEFAULT_ACCOUNT_LIMIT = 15;
export const TRIAL_DAYS = 7;
/** Workspaces that signed up from a referral link (see referrals.ts) get a longer trial. */
export const REFERRED_TRIAL_DAYS = 14;
export const trialDaysFor = (ws: { referred_by?: string | null } | null | undefined) => (ws?.referred_by ? REFERRED_TRIAL_DAYS : TRIAL_DAYS);

export const billingEnabled = () => !!process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(503, 'Billing is not set up yet.');
  return (client ||= new Stripe(key));
}

export const planForPrice = (priceId?: string | null): PlanId | null =>
  (Object.values(PLANS).find((p) => p.price() === priceId || p.yearlyPrice() === priceId)?.id as PlanId) ?? null;
export const intervalForPrice = (priceId?: string | null): Interval | null =>
  Object.values(PLANS).some((p) => p.yearlyPrice() === priceId) ? 'year' : Object.values(PLANS).some((p) => p.price() === priceId) ? 'month' : null;

/** Statuses that keep a workspace publishing. past_due keeps working while Stripe retries the card. */
const PAID = ['active', 'trialing', 'past_due', 'comped'];

export type Access = {
  /** free: no paid plan (never had one, or it ended). trial: Stripe trial. */
  state: 'free' | 'trial' | 'active' | 'past_due';
  /** On Solo or Studio (trial included), or billing is off: every feature, no Free limits. */
  paid: boolean;
  /** On Free after a trial or plan ended (rather than never having had one). */
  ended: boolean;
  plan: string;
  trialEndsAt: number | null;
  daysLeft: number | null;
  trialEligible: boolean;
  canPublish: boolean;
  canInvite: boolean;
};

export function accessFor(ws: any): Access {
  const status = ws.subscription_status as string | null;
  const trialEndsAt = ws.trial_ends_at ? Number(ws.trial_ends_at) : null;
  const trialEligible = !ws.trial_used && status !== 'comped';
  if (!billingEnabled()) {
    return { state: 'active', paid: true, ended: false, plan: ws.plan, trialEndsAt: null, daysLeft: null, trialEligible, canPublish: true, canInvite: true };
  }
  if (status && PAID.includes(status)) {
    const trialing = status === 'trialing';
    return {
      state: status === 'past_due' ? 'past_due' : trialing ? 'trial' : 'active',
      paid: true,
      ended: false,
      plan: ws.plan,
      trialEndsAt,
      daysLeft: trialing && trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now()) / 86400000)) : null,
      trialEligible,
      canPublish: true,
      // Team members are a Studio feature, including during a Studio trial.
      canInvite: ws.plan === 'studio',
    };
  }
  const ended = !!ws.stripe_subscription_id || !!ws.trial_used;
  return { state: 'free', paid: false, ended, plan: FREE_PLAN.id, trialEndsAt: null, daysLeft: null, trialEligible, canPublish: true, canInvite: false };
}

/** SQL condition (workspace alias `w` by default) matching isPaid. */
export const paidSql = (w = 'w') =>
  billingEnabled() ? `${w}.subscription_status IN ('active','trialing','past_due','comped')` : 'true';

/** Solo, Studio (trial included) or billing off: no Free limits apply. */
export const isPaid = (ws: any) => accessFor(ws).paid;

/** Refuses a paid-only feature (see PAID_FEATURES in lib/plan-limits.js) for a Free workspace with a 402. */
export function requirePaid(ws: any, feature: string) {
  if (!isPaid(ws)) throw new HttpError(402, paidOnlyMessage(feature));
}

/** Loads the workspace, then requirePaid. */
export async function requirePaidWorkspace(workspaceId: string, feature: string) {
  const ws = await one('SELECT * FROM workspaces WHERE id=$1', [workspaceId]);
  if (ws) requirePaid(ws, feature);
}

/**
 * How many accounts the workspace may connect. Free is always Free's limit, whatever is stored; with
 * billing off nothing is limited below the old default of 15.
 */
export function accountLimitOf(ws: any): number {
  const stored = Number(ws?.account_limit) || DEFAULT_ACCOUNT_LIMIT;
  if (!billingEnabled()) return Math.max(stored, DEFAULT_ACCOUNT_LIMIT);
  return isPaid(ws) ? stored : FREE_PLAN.accountLimit;
}

/** Writes a Stripe subscription's state onto its workspace. Ignores subscriptions that aren't Schedule For You's. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const item = sub.items?.data?.[0];
  const plan = planForPrice(item?.price?.id);
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  const ws =
    (sub.metadata?.workspace_id && (await one('SELECT id, stripe_subscription_id FROM workspaces WHERE id=$1', [sub.metadata.workspace_id]))) ||
    (customerId && (await one('SELECT id, stripe_subscription_id FROM workspaces WHERE stripe_customer_id=$1', [customerId])));
  if (!ws || (!plan && !sub.metadata?.workspace_id)) return null; // another business on this Stripe account
  // An older subscription's events must not overwrite a newer one.
  if (ws.stripe_subscription_id && ws.stripe_subscription_id !== sub.id && ['canceled', 'incomplete_expired'].includes(sub.status)) return ws.id;
  // Newer API versions keep the period on the item; webhooks in older account versions keep it on the subscription.
  const periodEnd: number | undefined = item?.current_period_end ?? (sub as any).current_period_end;
  const live = PAID.includes(sub.status);
  const p = plan ? PLANS[plan] : null;
  await exec(
    `UPDATE workspaces SET stripe_customer_id=COALESCE(stripe_customer_id,$1), stripe_subscription_id=$2, subscription_status=$3,
       plan=$4, account_limit=$5, current_period_end=$6, cancel_at_period_end=$7,
       trial_ends_at=$9, trial_used = trial_used OR $10, billing_interval=$11 WHERE id=$8`,
    [
      customerId ?? null, sub.id, sub.status,
      live && p ? p.id : FREE_PLAN.id,
      live && p ? p.accountLimit : FREE_PLAN.accountLimit,
      periodEnd ? periodEnd * 1000 : null,
      !!sub.cancel_at_period_end, ws.id,
      sub.status === 'trialing' && sub.trial_end ? sub.trial_end * 1000 : null,
      !!sub.trial_end,
      intervalForPrice(item?.price?.id) ?? item?.price?.recurring?.interval ?? null,
    ],
  );
  return ws.id;
}

/** Billing summary for the dashboard. */
export function billingSummary(ws: any) {
  const a = accessFor(ws);
  return {
    enabled: billingEnabled(),
    ...a,
    status: ws.subscription_status ?? null,
    periodEnd: ws.current_period_end ? Number(ws.current_period_end) : null,
    cancelAtPeriodEnd: !!ws.cancel_at_period_end,
    hasCustomer: !!ws.stripe_customer_id,
    trialDays: trialDaysFor(ws),
    interval: (ws.billing_interval as Interval | null) ?? null,
    accountLimit: accountLimitOf(ws),
    free: { accountLimit: FREE_PLAN.accountLimit, queueLimit: FREE_PLAN.queueLimit },
    plans: Object.values(PLANS).map((p) => ({ id: p.id, name: p.name, amount: p.amount, yearlyAmount: p.yearlyAmount, accountLimit: p.accountLimit, team: p.team })),
  };
}
