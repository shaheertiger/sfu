import { NextResponse } from 'next/server';
import { runDue } from '@/lib/server/publisher';
import { sendDigests, sendReminders } from '@/lib/server/notify';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/** Vercel Cron hits this every minute (see vercel.json): publishes due posts, then sends reminder and digest emails. Protected by CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await runDue({ budgetMs: 220_000 });
  if (result.processed) console.log('[cron] published', result);
  // Emails run after publishing so a slow email provider never delays posts.
  const reminders = await sendReminders().catch((e) => (console.error('[cron] reminders', e), 0));
  const digests = await sendDigests().catch((e) => (console.error('[cron] digests', e), 0));
  return NextResponse.json({ ...result, reminders, digests });
}
