import { NextResponse } from 'next/server';
import { runDue } from '@/lib/server/publisher';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/** Vercel Cron hits this every minute (see vercel.json). Protected by CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await runDue({ budgetMs: 240_000 });
  if (result.processed) console.log('[cron] published', result);
  return NextResponse.json(result);
}
