import { NextResponse } from 'next/server';
import { runDue } from '@/lib/server/publisher';
import { sendDigests, sendReminders } from '@/lib/server/notify';
import { pollFeeds } from '@/lib/server/rss';
import { exec, now } from '@/lib/server/db';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const BUDGET_MS = 270_000; // leave headroom under maxDuration for the response

/**
 * Vercel Cron hits this every minute (see vercel.json): publishes due posts, sends reminder and
 * digest emails, checks RSS feeds and removes stale rows. Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const started = now();
  const deadline = started + BUDGET_MS;
  const result = await runDue({ budgetMs: 200_000 });
  if (result.processed) console.log('[cron] published', result);
  // Emails run after publishing so a slow email provider never delays posts.
  const reminders = await sendReminders().catch((e) => (console.error('[cron] reminders', e), 0));
  const digests = await sendDigests().catch((e) => (console.error('[cron] digests', e), 0));
  const rss = await pollFeeds({ deadline }).catch((e) => (console.error('[cron] rss', e), 0));
  await cleanup().catch((e) => console.error('[cron] cleanup', e));
  return NextResponse.json({ ...result, reminders, digests, rss, ms: now() - started });
}

/** Rows that outlived their purpose: uploads that never finished and OAuth handshakes that were abandoned. */
async function cleanup() {
  const t = now();
  await exec('DELETE FROM media WHERE NOT uploaded AND created_at < $1', [t - 24 * 3600_000]);
  await exec('DELETE FROM oauth_states WHERE created_at < $1', [t - 3600_000]);
  await exec('DELETE FROM post_shares WHERE expires_at < $1', [t - 30 * 86400_000]);
}
