import { NextResponse } from 'next/server';
import { handleNeonAuthWebhook } from '@/lib/server/neon-webhook';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Neon Auth webhook (Neon Console → Auth → Configuration → Webhooks → https://scheduleforyou.com/api/webhooks/neon-auth,
 * event send.magic_link). Sends our own password reset, email confirmation and sign-in link emails through Resend.
 */
export async function POST(req: Request) {
  // The signature covers the exact bytes, so read the raw body before anything parses it.
  const raw = await req.text();
  const { status, body } = await handleNeonAuthWebhook(raw, req.headers);
  return NextResponse.json(body, { status });
}
