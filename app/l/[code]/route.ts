import { NextResponse } from 'next/server';
import { recordClick } from '@/lib/server/links';

export const dynamic = 'force-dynamic';

/** Tracked link: counts the visit and sends the visitor on. */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  let url: string | null = null;
  try {
    url = await recordClick(code);
  } catch (e: any) {
    console.error('[links]', e?.message || e);
  }
  if (!url) return new NextResponse('This link does not exist or has expired.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex' } });
  return NextResponse.redirect(url, { status: 302, headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer-when-downgrade' } });
}
