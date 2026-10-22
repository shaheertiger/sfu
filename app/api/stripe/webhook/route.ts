import { NextResponse } from 'next/server';
import { stripe, syncSubscription } from '@/lib/server/billing';
import { exec, now, query } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

/**
 * Stripe webhook (Stripe Dashboard → Developers → Webhooks → https://scheduleforyou.com/api/stripe/webhook).
 * Events: checkout.session.completed, customer.subscription.created/updated/deleted.
 * The Stripe account also serves other businesses, so anything that isn't a Schedule For You subscription is ignored.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Billing is not set up' }, { status: 503 });
  const raw = await req.text();
  let event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, req.headers.get('stripe-signature') || '', secret);
  } catch (e: any) {
    return NextResponse.json({ error: `Bad signature: ${e?.message || e}` }, { status: 400 });
  }

  // Each event once. If handling fails, the row is removed so Stripe's retry runs it again.
  const fresh = await query('INSERT INTO stripe_events (id, type, created_at) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING RETURNING id', [event.id, event.type, now()]);
  if (!fresh.length) return NextResponse.json({ received: true, duplicate: true });
  try {
    let workspace: string | null = null;
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        if (s.mode === 'subscription' && s.subscription && s.metadata?.app === 'schedule-for-you') {
          const sub = await stripe().subscriptions.retrieve(typeof s.subscription === 'string' ? s.subscription : s.subscription.id);
          workspace = await syncSubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        workspace = await syncSubscription(event.data.object);
        break;
    }
    if (workspace) console.log(`[stripe] ${event.type} → ${workspace}`);
    return NextResponse.json({ received: true });
  } catch (e: any) {
    await exec('DELETE FROM stripe_events WHERE id=$1', [event.id]).catch(() => {});
    console.error('[stripe] webhook failed:', event.type, e?.message || e);
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }
}
