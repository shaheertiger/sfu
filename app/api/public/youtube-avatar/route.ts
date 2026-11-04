import { NextResponse } from 'next/server';
import { capHeaders, takeAnonUse } from '@/lib/server/anon-cap';
import { findChannelImages, toFetchUrl } from '@/lib/server/youtube-avatar';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/youtube-avatar?q=<channel link | @handle | channel ID | video link>
 * Returns { title, channelUrl, avatar, banner } where avatar and banner are image URLs without a
 * size suffix (append "=s800", "=s0" and so on). Counted against a daily per-visitor cap (60 lookups).
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json({ error: 'Paste a channel link, @handle or video link.' }, { status: 400 });
  // Reject text that isn't a YouTube link, handle or ID before it uses up one of the visitor's lookups.
  if (!toFetchUrl(q)) return NextResponse.json({ error: 'That doesn’t look like a YouTube channel. Paste a channel link (youtube.com/@name), an @handle, a channel ID (UC…) or a video link.' }, { status: 400 });

  const cap = await takeAnonUse(req, 'youtube-avatar', 60);
  if (!cap.allowed) return NextResponse.json({ error: 'You’ve reached today’s lookup limit. Try again tomorrow (it resets at midnight UTC).', resetAt: cap.resetAt }, { status: 429, headers: capHeaders(cap) });

  try {
    const found = await findChannelImages(q);
    if (!found) return NextResponse.json({ error: 'We couldn’t find that channel. Check the link or @handle and try again.' }, { status: 404, headers: capHeaders(cap) });
    return NextResponse.json(found, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', ...capHeaders(cap) } });
  } catch {
    return NextResponse.json({ error: 'YouTube didn’t respond. Try again in a minute.' }, { status: 502, headers: capHeaders(cap) });
  }
}
