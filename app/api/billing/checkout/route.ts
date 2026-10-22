import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { HttpError } from '@/lib/server/auth';
import { accessFor, PLANS, stripe, TRIAL_DAYS } from '@/lib/server/billing';
import { exec, one } from '@/lib/server/db';
import { appUrl } from '@/lib/server/url';

/** Starts Stripe Checkout for a plan. Returns { url } to redirect to. Owners only. */
export const POST = handler(async ({ req, workspace, user }) => {
  if (workspace.role !== 'owner') throw new HttpError(403, 'Only the workspace owner can manage billing');
  const { plan } = z.object({ plan: z.enum(['solo', 'studio']) }).parse(await body(req));
  const ws = await one('SELECT * FROM workspaces WHERE id=$1', [workspace.id]);
  const s = stripe();
  const base = appUrl(req);

  // Already subscribed: plan changes, cards and cancelling happen in the billing portal.
  if (ws.stripe_subscription_id && accessFor(ws).canPublish) {
    const portal = await s.billingPortal.sessions.create({
      customer: ws.stripe_customer_id,
      return_url: `${base}/app`,
      ...(process.env.STRIPE_PORTAL_CONFIGURATION ? { configuration: process.env.STRIPE_PORTAL_CONFIGURATION } : {}),
    });
    return json({ url: portal.url });
  }

  let customer = ws.stripe_customer_id as string | null;
  if (!customer) {
    const c = await s.customers.create({ email: user!.email, name: user!.name || undefined, metadata: { workspace_id: ws.id, app: 'schedule-for-you' } });
    // Two clicks at once: keep whichever customer was saved first.
    await exec('UPDATE workspaces SET stripe_customer_id=COALESCE(stripe_customer_id,$1) WHERE id=$2', [c.id, ws.id]);
    customer = (await one('SELECT stripe_customer_id FROM workspaces WHERE id=$1', [ws.id])).stripe_customer_id;
  }

  // One 7-day free trial per workspace. Checkout always collects a card; Stripe charges when the trial ends.
  const trial = !ws.trial_used && !ws.stripe_subscription_id;
  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    customer: customer!,
    client_reference_id: ws.id,
    line_items: [{ price: PLANS[plan].price(), quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { workspace_id: ws.id, app: 'schedule-for-you' },
    payment_method_collection: 'always',
    subscription_data: {
      metadata: { workspace_id: ws.id, app: 'schedule-for-you' },
      ...(trial ? { trial_period_days: TRIAL_DAYS, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } } : {}),
    },
    success_url: `${base}/app?billing=success`,
    cancel_url: `${base}/app?billing=cancel`,
  });
  return json({ url: session.url });
}, { sessionOnly: true });
