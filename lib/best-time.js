/**
 * Best time to post: pure helpers shared by the aggregation cron, the public API and the
 * /best-time-to-post pages. No database access here (lib/server/best-time.ts does that).
 *
 * Data model: a 7×24 grid (weekday 0 = Sunday … 6 = Saturday, hour 0–23, in the viewer's local
 * time) of how many posts Schedule For You customers scheduled in that slot over the last 90
 * days, plus link clicks those posts earned. "Best" slots are the busiest ones with the best
 * clicks-per-post: when thousands of accounts choose a slot, it is a strong prior for when
 * audiences are online. Until a platform × region cell has enough data it falls back to the
 * platform's global grid, then to a published baseline, and the page says which one it shows.
 */

export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Platforms with a best-time page. `slug` is the URL segment, `id` the social_accounts.platform value. */
export const BEST_TIME_PLATFORMS = [
  { slug: 'instagram', id: 'instagram', name: 'Instagram', formats: ['posts', 'reels', 'stories'] },
  { slug: 'tiktok', id: 'tiktok', name: 'TikTok', formats: ['videos'] },
  { slug: 'facebook', id: 'facebook', name: 'Facebook', formats: ['posts', 'reels'] },
  { slug: 'linkedin', id: 'linkedin', name: 'LinkedIn', formats: ['posts'] },
  { slug: 'x', id: 'x', name: 'X', formats: ['posts'] },
  { slug: 'threads', id: 'threads', name: 'Threads', formats: ['posts'] },
  { slug: 'youtube', id: 'youtube', name: 'YouTube', formats: ['videos', 'shorts'] },
  { slug: 'pinterest', id: 'pinterest', name: 'Pinterest', formats: ['pins'] },
  { slug: 'bluesky', id: 'bluesky', name: 'Bluesky', formats: ['posts'] },
  { slug: 'google-business', id: 'google', name: 'Google Business Profile', formats: ['posts'] },
];

export const platformBySlug = (slug) => BEST_TIME_PLATFORMS.find((p) => p.slug === slug) || null;

/**
 * Country segments with their own pages (/best-time-to-post/instagram/in-india). Chosen from the
 * countries that search for "best time to post on … in {country}" (Semrush, Nov 2026) and the
 * ones Schedule For You has customers in. `code` matches best_time_stats.region.
 */
export const COUNTRIES = [
  { slug: 'usa', code: 'US', name: 'the United States', short: 'USA', tz: 'America/New_York' },
  { slug: 'uk', code: 'GB', name: 'the UK', short: 'UK', tz: 'Europe/London' },
  { slug: 'india', code: 'IN', name: 'India', short: 'India', tz: 'Asia/Kolkata' },
  { slug: 'canada', code: 'CA', name: 'Canada', short: 'Canada', tz: 'America/Toronto' },
  { slug: 'australia', code: 'AU', name: 'Australia', short: 'Australia', tz: 'Australia/Sydney' },
  { slug: 'philippines', code: 'PH', name: 'the Philippines', short: 'Philippines', tz: 'Asia/Manila' },
  { slug: 'pakistan', code: 'PK', name: 'Pakistan', short: 'Pakistan', tz: 'Asia/Karachi' },
  { slug: 'nigeria', code: 'NG', name: 'Nigeria', short: 'Nigeria', tz: 'Africa/Lagos' },
  { slug: 'germany', code: 'DE', name: 'Germany', short: 'Germany', tz: 'Europe/Berlin' },
  { slug: 'france', code: 'FR', name: 'France', short: 'France', tz: 'Europe/Paris' },
  { slug: 'brazil', code: 'BR', name: 'Brazil', short: 'Brazil', tz: 'America/Sao_Paulo' },
  { slug: 'mexico', code: 'MX', name: 'Mexico', short: 'Mexico', tz: 'America/Mexico_City' },
  { slug: 'indonesia', code: 'ID', name: 'Indonesia', short: 'Indonesia', tz: 'Asia/Jakarta' },
  { slug: 'malaysia', code: 'MY', name: 'Malaysia', short: 'Malaysia', tz: 'Asia/Kuala_Lumpur' },
  { slug: 'south-africa', code: 'ZA', name: 'South Africa', short: 'South Africa', tz: 'Africa/Johannesburg' },
  { slug: 'uae', code: 'AE', name: 'the UAE', short: 'UAE', tz: 'Asia/Dubai' },
  { slug: 'kenya', code: 'KE', name: 'Kenya', short: 'Kenya', tz: 'Africa/Nairobi' },
  { slug: 'japan', code: 'JP', name: 'Japan', short: 'Japan', tz: 'Asia/Tokyo' },
  { slug: 'spain', code: 'ES', name: 'Spain', short: 'Spain', tz: 'Europe/Madrid' },
  { slug: 'italy', code: 'IT', name: 'Italy', short: 'Italy', tz: 'Europe/Rome' },
  { slug: 'netherlands', code: 'NL', name: 'the Netherlands', short: 'Netherlands', tz: 'Europe/Amsterdam' },
  { slug: 'ireland', code: 'IE', name: 'Ireland', short: 'Ireland', tz: 'Europe/Dublin' },
  { slug: 'new-zealand', code: 'NZ', name: 'New Zealand', short: 'New Zealand', tz: 'Pacific/Auckland' },
  { slug: 'singapore', code: 'SG', name: 'Singapore', short: 'Singapore', tz: 'Asia/Singapore' },
];
export const countryBySlug = (slug) => COUNTRIES.find((c) => c.slug === slug) || null;
export const countryByCode = (code) => COUNTRIES.find((c) => c.code === code) || null;

/** IANA zone → ISO country, for the zones workspaces actually use. Unknown zones count as GLOBAL only. */
const TZ_COUNTRY = {
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Detroit': 'US', 'America/Boise': 'US', 'America/Indiana/Indianapolis': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Lisbon': 'PT', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Athens': 'GR', 'Europe/Istanbul': 'TR', 'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Bucharest': 'RO', 'Europe/Budapest': 'HU', 'Europe/Vilnius': 'LT',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Manila': 'PH', 'Asia/Jakarta': 'ID', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Singapore': 'SG', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Jerusalem': 'IL', 'Asia/Colombo': 'LK', 'Asia/Kathmandu': 'NP',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
  'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Africa/Johannesburg': 'ZA', 'Africa/Cairo': 'EG', 'Africa/Accra': 'GH', 'Africa/Casablanca': 'MA',
  'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Argentina/Buenos_Aires': 'AR', 'America/Lima': 'PE', 'America/Santiago': 'CL',
};
export function countryOfTimezone(tz) {
  return TZ_COUNTRY[tz] || null;
}

/** How many posts a cell needs before its own grid is shown instead of a broader one. */
export const MIN_POSTS_REGION = 150;
export const MIN_POSTS_GLOBAL = 400;

export function emptyGrid() {
  return Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ posts: 0, clicks: 0 })));
}

/**
 * A published baseline used until our own numbers are large enough. Shape: weekday mornings and
 * lunch peak, evenings secondary, weekends later and flatter — the pattern most published
 * studies agree on. Values are relative weights (not post counts) and are labelled "baseline" in
 * the UI; never present them as measured data.
 */
export function baselineGrid(platformId) {
  const g = emptyGrid();
  const weekdayCurve = [1, 1, 1, 1, 1, 2, 4, 7, 9, 10, 9, 8, 9, 8, 7, 6, 6, 7, 8, 8, 7, 5, 3, 2];
  const weekendCurve = [1, 1, 1, 1, 1, 1, 2, 3, 5, 7, 9, 9, 8, 7, 7, 6, 6, 6, 7, 8, 8, 6, 4, 2];
  const eveningLean = ['tiktok', 'instagram', 'youtube', 'threads', 'bluesky'].includes(platformId);
  const businessLean = ['linkedin', 'google', 'x'].includes(platformId);
  for (let d = 0; d < 7; d++) {
    const weekend = d === 0 || d === 6;
    for (let h = 0; h < 24; h++) {
      let w = (weekend ? weekendCurve : weekdayCurve)[h];
      if (eveningLean && h >= 18 && h <= 22) w += 3;
      if (businessLean && !weekend && h >= 7 && h <= 11) w += 3;
      if (businessLean && weekend) w = Math.max(1, w - 3);
      g[d][h] = { posts: w * 10, clicks: 0 };
    }
  }
  return g;
}

/** Rows from best_time_stats → grid. @param {StatRow[]} rows */
export function gridFromRows(rows) {
  const g = emptyGrid();
  for (const r of rows) {
    if (r.weekday < 0 || r.weekday > 6 || r.hour < 0 || r.hour > 23) continue;
    g[r.weekday][r.hour] = { posts: Number(r.posts) || 0, clicks: Number(r.clicks) || 0 };
  }
  return g;
}

export const gridTotal = (g) => g.reduce((s, d) => s + d.reduce((t, c) => t + c.posts, 0), 0);

/**
 * Score of a slot: its share of posts, lifted by clicks per post (a slot people both choose and
 * get results from). Returns 0–100 across the grid, 100 = the best slot.
 */
export function scoreGrid(g) {
  const total = gridTotal(g) || 1;
  const cpp = g.map((d) => d.map((c) => (c.posts ? c.clicks / c.posts : 0)));
  const maxCpp = Math.max(0, ...cpp.flat());
  const raw = g.map((d, di) => d.map((c, hi) => (c.posts / total) * (1 + (maxCpp ? cpp[di][hi] / maxCpp : 0))));
  const max = Math.max(0, ...raw.flat()) || 1;
  return raw.map((d) => d.map((v) => Math.round((v / max) * 100)));
}

/** The n best slots overall, best first: [{ weekday, hour, score }]. */
export function topSlots(scores, n = 5) {
  const all = [];
  scores.forEach((d, weekday) => d.forEach((score, hour) => all.push({ weekday, hour, score })));
  return all.sort((a, b) => b.score - a.score || a.weekday - b.weekday || a.hour - b.hour).slice(0, n);
}

/** Best hours of one weekday, best first. */
export function topHoursOfDay(scores, weekday, n = 3) {
  return scores[weekday].map((score, hour) => ({ hour, score })).sort((a, b) => b.score - a.score || a.hour - b.hour).slice(0, n);
}

/** Best weekday (highest summed score). */
export function bestWeekday(scores) {
  let best = 0;
  let bestSum = -1;
  scores.forEach((d, i) => {
    const s = d.reduce((a, b) => a + b, 0);
    if (s > bestSum) { bestSum = s; best = i; }
  });
  return best;
}

export function formatHour(h) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh} ${suffix}`;
}
export function formatRange(h) {
  return `${formatHour(h)}–${formatHour((h + 1) % 24)}`;
}

/**
 * Picks which grid to show for a platform and optional country and says where it came from:
 * 'region' (the country's own data), 'global' (the platform's data everywhere) or 'baseline'.
 */
/**
 * @typedef {{ weekday: number, hour: number, posts: number, clicks: number }} StatRow
 * @typedef {'region' | 'global' | 'baseline'} GridSource
 * @param {{ regionRows?: StatRow[], globalRows?: StatRow[], platformId: string }} opts
 * @returns {{ grid: { posts: number, clicks: number }[][], source: GridSource, posts: number }}
 */
export function pickGrid({ regionRows = [], globalRows = [], platformId }) {
  const region = gridFromRows(regionRows);
  if (gridTotal(region) >= MIN_POSTS_REGION) return { grid: region, source: /** @type {GridSource} */ ('region'), posts: gridTotal(region) };
  const global = gridFromRows(globalRows);
  if (gridTotal(global) >= MIN_POSTS_GLOBAL) return { grid: global, source: /** @type {GridSource} */ ('global'), posts: gridTotal(global) };
  return { grid: baselineGrid(platformId), source: /** @type {GridSource} */ ('baseline'), posts: gridTotal(global) };
}
