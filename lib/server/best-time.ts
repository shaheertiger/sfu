import 'server-only';
import { exec, now, query } from '@/lib/server/db';
import { localParts, safeTz } from '@/lib/server/tz';
import { BEST_TIME_PLATFORMS, COUNTRIES, countryOfTimezone, pickGrid } from '@/lib/best-time';
import { trendsGlobalGrid, trendsGrid } from '@/lib/best-time-trends';

const WINDOW_MS = 90 * 86400_000;

type TargetRow = { platform: string; published_at: number; tz: string | null; clicks: number | null };

/**
 * Rebuilds best_time_stats from the last 90 days of published targets. Each target is bucketed
 * by the publishing workspace's timezone (local weekday × hour), once under its country (when the
 * timezone maps to one) and once under GLOBAL. Only counts leave the table: no captions, accounts
 * or workspace ids. Runs daily from /api/cron/best-time; safe to run more often.
 */
export async function aggregateBestTime(at = now()) {
  const since = at - WINDOW_MS;
  const rows = await query<TargetRow>(
    `SELECT a.platform, t.published_at, w.prefs->>'tz' AS tz, COALESCE((t.stats->>'clicks')::int, 0) AS clicks
       FROM post_targets t
       JOIN posts p ON p.id = t.post_id
       JOIN social_accounts a ON a.id = t.account_id
       JOIN workspaces w ON w.id = p.workspace_id
      WHERE t.status = 'published' AND t.published_at IS NOT NULL AND t.published_at >= $1`,
    [since],
  );
  const cells = new Map<string, { platform: string; region: string; weekday: number; hour: number; posts: number; clicks: number }>();
  const bump = (platform: string, region: string, weekday: number, hour: number, clicks: number) => {
    const k = `${platform}|${region}|${weekday}|${hour}`;
    const c = cells.get(k) || { platform, region, weekday, hour, posts: 0, clicks: 0 };
    c.posts += 1;
    c.clicks += clicks;
    cells.set(k, c);
  };
  for (const r of rows) {
    const tz = safeTz(r.tz);
    const l = localParts(tz, Number(r.published_at));
    const weekday = new Date(Date.UTC(l.y, l.mo, l.d)).getUTCDay();
    const clicks = Number(r.clicks) || 0;
    bump(r.platform, 'GLOBAL', weekday, l.h, clicks);
    const country = countryOfTimezone(tz);
    if (country) bump(r.platform, country, weekday, l.h, clicks);
  }
  await exec('DELETE FROM best_time_stats');
  const list = [...cells.values()];
  for (let i = 0; i < list.length; i += 500) {
    const chunk = list.slice(i, i + 500);
    const values: any[] = [];
    const tuples = chunk.map((c, j) => {
      values.push(c.platform, c.region, c.weekday, c.hour, c.posts, c.clicks, at);
      const b = j * 7;
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7})`;
    });
    await exec(`INSERT INTO best_time_stats (platform, region, weekday, hour, posts, clicks, computed_at) VALUES ${tuples.join(',')}`, values);
  }
  return { targets: rows.length, cells: list.length };
}

export type BestTimeData = {
  grid: { posts: number; clicks: number }[][];
  source: 'region' | 'trends' | 'global' | 'baseline';
  posts: number;
  trendsKind?: string;
  computedAt: number | null;
};

/** The grid to show for a platform (social_accounts.platform id) and optional ISO country. Never throws: a missing database yields the baseline. */
export async function getBestTime(platformId: string, region?: string | null): Promise<BestTimeData> {
  try {
    const globalRows = await query('SELECT weekday, hour, posts, clicks, computed_at FROM best_time_stats WHERE platform=$1 AND region=$2', [platformId, 'GLOBAL']);
    const regionRows = region ? await query('SELECT weekday, hour, posts, clicks, computed_at FROM best_time_stats WHERE platform=$1 AND region=$2', [platformId, region]) : [];
    const picked = pickGrid({ regionRows, globalRows, platformId, trends: region ? trendsGrid(platformId, region) : trendsGlobalGrid(platformId) });
    const computedAt = (regionRows[0] || globalRows[0])?.computed_at ?? null;
    return { ...picked, computedAt: computedAt ? Number(computedAt) : null };
  } catch (e) {
    console.error('[best-time] read', (e as Error)?.message || e);
    const picked = pickGrid({ platformId, trends: region ? trendsGrid(platformId, region) : trendsGlobalGrid(platformId) });
    return { ...picked, computedAt: null };
  }
}

type StatRowDb = { platform: string; region: string; weekday: number; hour: number; posts: number; clicks: number; computed_at: number | null };

function splitRows(rows: StatRowDb[], key: 'platform' | 'region') {
  const out = new Map<string, StatRowDb[]>();
  for (const r of rows) {
    const k = r[key];
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(r);
  }
  return out;
}

function toData(regionRows: StatRowDb[], globalRows: StatRowDb[], platformId: string, region: string | null): BestTimeData {
  const picked = pickGrid({ regionRows, globalRows, platformId, trends: region ? trendsGrid(platformId, region) : trendsGlobalGrid(platformId) });
  const computedAt = (regionRows[0] || globalRows[0])?.computed_at ?? null;
  return { ...picked, computedAt: computedAt ? Number(computedAt) : null };
}

/** Every platform's grid for one country (or worldwide when `region` is null), in one query. Never throws. */
export async function getBestTimeAllPlatforms(region: string | null): Promise<Record<string, BestTimeData>> {
  let rows: StatRowDb[] = [];
  try {
    rows = await query<StatRowDb>('SELECT platform, region, weekday, hour, posts, clicks, computed_at FROM best_time_stats WHERE region = ANY($1)', [region ? [region, 'GLOBAL'] : ['GLOBAL']]);
  } catch (e) {
    console.error('[best-time] read all platforms', (e as Error)?.message || e);
  }
  const byPlatform = splitRows(rows, 'platform');
  const out: Record<string, BestTimeData> = {};
  for (const p of BEST_TIME_PLATFORMS) {
    const list = byPlatform.get(p.id) || [];
    out[p.id] = toData(region ? list.filter((r) => r.region === region) : [], list.filter((r) => r.region === 'GLOBAL'), p.id, region);
  }
  return out;
}

/** One platform's grid in every country page we have, keyed by country slug, in one query. Never throws. */
export async function getBestTimeAllCountries(platformId: string): Promise<Record<string, BestTimeData>> {
  let rows: StatRowDb[] = [];
  try {
    rows = await query<StatRowDb>('SELECT platform, region, weekday, hour, posts, clicks, computed_at FROM best_time_stats WHERE platform = $1', [platformId]);
  } catch (e) {
    console.error('[best-time] read all countries', (e as Error)?.message || e);
  }
  const byRegion = splitRows(rows, 'region');
  const globalRows = byRegion.get('GLOBAL') || [];
  const out: Record<string, BestTimeData> = {};
  for (const c of COUNTRIES) out[c.slug] = toData(byRegion.get(c.code) || [], globalRows, platformId, c.code);
  return out;
}
