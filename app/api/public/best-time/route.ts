import { NextResponse } from 'next/server';
import { getBestTime } from '@/lib/server/best-time';
import { capHeaders, takeAnonUse } from '@/lib/server/anon-cap';
import { COUNTRIES, WEEKDAYS, formatHour, platformBySlug, scoreGrid, topSlots } from '@/lib/best-time';

export const dynamic = 'force-dynamic';

/**
 * Public, signed-out JSON for the best-time widgets and third parties:
 *   GET /api/public/best-time?platform=instagram&country=india
 * Returns the 7×24 score grid (0–100) and the top slots in the viewer's local time. Counted
 * against the anonymous daily cap (60/day) so it can be embedded without being scraped.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = platformBySlug(url.searchParams.get('platform') || '');
  if (!platform) return NextResponse.json({ error: 'Unknown platform', platforms: ['instagram', 'tiktok', 'facebook', 'linkedin', 'x', 'threads', 'youtube', 'pinterest', 'bluesky', 'google-business'] }, { status: 400 });
  const countrySlug = url.searchParams.get('country');
  const country = countrySlug ? COUNTRIES.find((c) => c.slug === countrySlug) : null;
  if (countrySlug && !country) return NextResponse.json({ error: 'Unknown country', countries: COUNTRIES.map((c) => c.slug) }, { status: 400 });

  const cap = await takeAnonUse(req, 'best-time', 60);
  if (!cap.allowed) return NextResponse.json({ error: 'Daily limit reached for signed-out use. Create a free account for unlimited access.', resetAt: cap.resetAt }, { status: 429, headers: capHeaders(cap) });

  const data = await getBestTime(platform.id, country?.code);
  const scores = scoreGrid(data.grid);
  const best = topSlots(scores, 5).map((s) => ({ weekday: WEEKDAYS[s.weekday], hour: s.hour, label: `${WEEKDAYS[s.weekday]} ${formatHour(s.hour)}`, score: s.score }));
  return NextResponse.json(
    { platform: platform.slug, country: country?.slug || null, source: data.source, posts: data.posts, computedAt: data.computedAt, timezoneNote: 'Hours are in the viewer\'s local time.', best, scores },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', 'Access-Control-Allow-Origin': '*', ...capHeaders(cap) } },
  );
}
