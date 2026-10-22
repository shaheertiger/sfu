import { handler, json } from '@/lib/server/api';
import { HttpError } from '@/lib/server/auth';
import { stripe } from '@/lib/server/billing';
import { one } from '@/lib/server/db';
import { appUrl } from '@/lib/server/url';

/** Stripe customer portal: change plan, update card, invoices, cancel. Owners only. */
export const POST = handler(async ({ req, workspace }) => {
  if (workspace.role !== 'owner') throw new HttpError(403, 'Only the workspace owner can manage billing');
  const ws = await one('SELECT stripe_customer_id FROM workspaces WHERE id=$1', [workspace.id]);
  if (!ws?.stripe_customer_id) throw new HttpError(409, 'Choose a plan first.');
  const portal = await stripe().billingPortal.sessions.create({
    customer: ws.stripe_customer_id,
    return_url: `${appUrl(req)}/app`,
    ...(process.env.STRIPE_PORTAL_CONFIGURATION ? { configuration: process.env.STRIPE_PORTAL_CONFIGURATION } : {}),
  });
  return json({ url: portal.url });
}, { sessionOnly: true });
