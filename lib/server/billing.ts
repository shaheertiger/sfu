import 'server-only';
import Stripe from 'stripe';
import { HttpError } from './auth';
import { exec, now, one } from './db';

/**
 * Stripe billing: one subscription per workspace.
 * STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET; optional STRIPE_PRICE_SOLO / STRIPE_PRICE_STUDIO
 * (default to the live prices created for Schedule For You) and STRIPE_PORTAL_CONFIGURATION.
 * Until STRIPE_SECRET_KEY is set, billing is off: trials never expire and nothing is blocked.
 */
export const PLANS = {
  solo: { id: 'solo', name: 'Solo', amount: 19, accountLimit: 15, team: false, price: () => process.env.STRIPE_PRICE_SOLO || 'price_1UTMrgPgKI4BZbGFEDOyBeTF' },
  studio: { id: 'studio', name: 'Studio', amount: 59, accountLimit: 100, team: true, price: () => process.env.STRIPE_PRICE_STUDIO || 'price_1UTMrhPgKI4BZbGF1pB8lYJf' },
} as const;
export type PlanId = keyof typeof PLANS;
const TRIAL_ACCOUNT_LIMIT = 15;

export const billingEnabled = () => !!process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(503, 'Billing is not set up yet.');
  return (client ||= new Stripe(key));
}

export const planForPrice = (priceId?: string | null): PlanId | null =>
  (Object.values(PLANS).find((p) => p.price() === priceId)?.id as PlanId) ?? null;

/** Statuses that keep a workspace publishing. past_due keeps working while Stripe retries the card. */
const PAID = ['active', 'trialing', 'past_due', 'comped'];

export type Access = {
  state: 'trial' | 'active' | 'past_due' | 'expired';
  plan: string;
  trialEndsAt: number | null;
  daysLeft: number | null;
  canPublish: boolean;
  canInvite: boolean;
};

export function accessFor(ws: any): Access {
  const status = ws.subscription_status as string | null;
  const trialEndsAt = ws.trial_ends_at ? Number(ws.trial_ends_at) : null;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now()) / 86400000)) : null;
  if (status && PAID.includes(status)) {
    return { state: status === 'past_due' ? 'past_due' : 'active', plan: ws.plan, trialEndsAt, daysLeft: null, canPublish: true, canInvite: ws.plan === 'studio' };
  }
  const inTrial = !billingEnabled() || !trialEndsAt || trialEndsAt > now();
  return { state: inTrial ? 'trial' : 'expired', plan: ws.plan, trialEndsAt, daysLeft, canPublish: inTrial, canInvite: inTrial };
}

/** SQL condition (workspace alias `w`) matching accessFor(...).canPublish. $1 must be now(). */
export const canPublishSql = () =>
  billingEnabled()
    ? `(w.subscription_status IN ('active','trialing','past_due','comped') OR w.trial_ends_at IS NULL OR w.trial_ends_at > $1::bigint)`
    : 'true';

export async function requireCanPublish(workspaceId: string) {
  const ws = await one('SELECT * FROM workspaces WHERE id=$1', [workspaceId]);
  if (ws && !accessFor(ws).canPublish) throw new HttpError(402, 'Your trial has ended. Choose a plan to keep publishing.');
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
  const live = PAID.includes(sub.status);
  const p = plan ? PLANS[plan] : null;
  await exec(
    `UPDATE workspaces SET stripe_customer_id=COALESCE(stripe_customer_id,$1), stripe_subscription_id=$2, subscription_status=$3,
       plan=$4, account_limit=$5, current_period_end=$6, cancel_at_period_end=$7 WHERE id=$8`,
    [
      customerId ?? null, sub.id, sub.status,
      live && p ? p.id : 'trial',
      live && p ? p.accountLimit : TRIAL_ACCOUNT_LIMIT,
      item?.current_period_end ? item.current_period_end * 1000 : null,
      !!sub.cancel_at_period_end, ws.id,
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
    plans: Object.values(PLANS).map((p) => ({ id: p.id, name: p.name, amount: p.amount, accountLimit: p.accountLimit, team: p.team })),
  };
}
