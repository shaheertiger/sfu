import crypto from 'node:crypto';

/**
 * Sign-up and plan counts for GET /api/admin/stats. Counts only: no emails, names or ids leave
 * the database, so the response is safe to paste into a chat or a spreadsheet.
 */

const DAY = 86_400_000;

export type Query = <T = any>(text: string, params?: any[]) => Promise<T[]>;

export type AdminStats = {
  generatedAt: string;
  users: { total: number; last24h: number; last7d: number; last30d: number; latestSignupAt: string | null };
  /** New users per UTC day, oldest first, for the last `days` days (today included). */
  signupsByDay: { date: string; count: number }[];
  workspaces: { total: number; byPlan: Record<string, number>; bySubscriptionStatus: Record<string, number> };
  socialAccounts: number;
  posts: { total: number; last7d: number };
};

/** Constant-time check of an `Authorization: Bearer <secret>` header. False when no secret is configured. */
export function isAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Clamps the ?days= parameter to 1–90 (default 14). */
export function parseDays(v: string | null): number {
  const n = Number.parseInt(v ?? '', 10);
  if (!Number.isFinite(n)) return 14;
  return Math.min(90, Math.max(1, n));
}

const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Fills in days with no sign-ups so the series has exactly `days` entries ending today (UTC). */
export function fillDays(rows: { day: string; n: number }[], nowMs: number, days: number) {
  const byDay = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = utcDay(nowMs - i * DAY);
    out.push({ date, count: byDay.get(date) ?? 0 });
  }
  return out;
}

const toMap = (rows: { k: string | null; n: number }[]) =>
  Object.fromEntries(rows.map((r) => [r.k ?? 'none', Number(r.n)]));

export async function getAdminStats(q: Query, nowMs: number, days = 14): Promise<AdminStats> {
  const startOfFirstDay = Date.parse(utcDay(nowMs - (days - 1) * DAY));
  const [users, byDay, plans, statuses, accounts, posts] = await Promise.all([
    q<{ total: number; d1: number; d7: number; d30: number; latest: number | null }>(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE created_at >= $1)::int AS d1,
              count(*) FILTER (WHERE created_at >= $2)::int AS d7,
              count(*) FILTER (WHERE created_at >= $3)::int AS d30,
              max(created_at) AS latest
         FROM users`,
      [nowMs - DAY, nowMs - 7 * DAY, nowMs - 30 * DAY],
    ),
    q<{ day: string; n: number }>(
      `SELECT to_char(to_timestamp(created_at / 1000.0) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day, count(*)::int AS n
         FROM users WHERE created_at >= $1 GROUP BY 1`,
      [startOfFirstDay],
    ),
    q<{ k: string; n: number }>(`SELECT plan AS k, count(*)::int AS n FROM workspaces GROUP BY 1 ORDER BY 2 DESC`),
    q<{ k: string | null; n: number }>(`SELECT subscription_status AS k, count(*)::int AS n FROM workspaces GROUP BY 1 ORDER BY 2 DESC`),
    q<{ n: number }>(`SELECT count(*)::int AS n FROM social_accounts`),
    q<{ total: number; d7: number }>(
      `SELECT count(*)::int AS total, count(*) FILTER (WHERE created_at >= $1)::int AS d7 FROM posts`,
      [nowMs - 7 * DAY],
    ),
  ]);
  const u = users[0] ?? { total: 0, d1: 0, d7: 0, d30: 0, latest: null };
  const byPlan = toMap(plans);
  return {
    generatedAt: new Date(nowMs).toISOString(),
    users: {
      total: Number(u.total),
      last24h: Number(u.d1),
      last7d: Number(u.d7),
      last30d: Number(u.d30),
      latestSignupAt: u.latest ? new Date(Number(u.latest)).toISOString() : null,
    },
    signupsByDay: fillDays(byDay, nowMs, days),
    workspaces: {
      total: Object.values(byPlan).reduce((a, b) => a + b, 0),
      byPlan,
      bySubscriptionStatus: toMap(statuses),
    },
    socialAccounts: Number(accounts[0]?.n ?? 0),
    posts: { total: Number(posts[0]?.total ?? 0), last7d: Number(posts[0]?.d7 ?? 0) },
  };
}
