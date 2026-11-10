import { NextResponse } from 'next/server';
import { getAdminStats, isAuthorized, parseDays } from '@/lib/server/admin-stats';
import { now, query } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

/**
 * Sign-up, plan and usage counts (no personal data). Protected by ADMIN_SECRET, falling back to
 * CRON_SECRET when ADMIN_SECRET isn't set:
 *   curl -H "Authorization: Bearer $ADMIN_SECRET" https://<app>/api/admin/stats?days=30
 */
export async function GET(req: Request) {
  const secret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
  if (!isAuthorized(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const days = parseDays(new URL(req.url).searchParams.get('days'));
  try {
    const stats = await getAdminStats(query, now(), days);
    return NextResponse.json(stats, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    console.error('[admin] stats', e);
    return NextResponse.json({ error: 'Stats query failed' }, { status: 500 });
  }
}
