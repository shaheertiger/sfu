import { NextResponse } from 'next/server';
import { aggregateBestTime } from '@/lib/server/best-time';
import { cleanupAnonUsage } from '@/lib/server/anon-cap';
import { now } from '@/lib/server/db';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

/**
 * Daily (see vercel.json): rebuilds the best-time-to-post statistics from the last 90 days of
 * published posts and drops yesterday's anonymous tool-usage counters. Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const started = now();
  const stats = await aggregateBestTime().catch((e) => (console.error('[cron] best-time', e), { targets: 0, cells: 0, error: String(e?.message || e) }));
  const cleaned = await cleanupAnonUsage().catch((e) => (console.error('[cron] anon cleanup', e), 0));
  return NextResponse.json({ ...stats, anonRowsRemoved: cleaned, ms: now() - started });
}
