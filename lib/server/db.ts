import 'server-only';
import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

/**
 * Postgres access. On Neon we use the serverless driver (WebSockets, works well on Vercel);
 * anywhere else (local Postgres, tests) we use node-postgres. Both expose the same query API.
 */
type Queryable = { query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number | null }> };
type PoolLike = Queryable & { connect: () => Promise<Queryable & { release: () => void }> };

declare global {
  // eslint-disable-next-line no-var
  var __sfyPool: PoolLike | undefined;
}

// BIGINT (int8) columns hold epoch milliseconds; return them as numbers.
pg.types.setTypeParser(20, (v: string) => Number(v));

function makePool(): PoolLike {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  if (/\.neon\.tech/.test(url)) {
    neonConfig.webSocketConstructor = ws;
    const pool = new NeonPool({ connectionString: url, max: 5 });
    return pool as unknown as PoolLike;
  }
  return new pg.Pool({ connectionString: url, max: 5 }) as unknown as PoolLike;
}

export function pool(): PoolLike {
  if (!global.__sfyPool) global.__sfyPool = makePool();
  return global.__sfyPool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const r = await pool().query(text, params);
  return r.rows.map(fixInts) as T[];
}
export async function one<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
export async function exec(text: string, params: any[] = []): Promise<number> {
  const r = await pool().query(text, params);
  return r.rowCount ?? 0;
}

/** Runs fn inside a transaction on a single connection. */
export async function tx<T>(fn: (q: <R = any>(text: string, params?: any[]) => Promise<R[]>) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    const out = await fn(async (text, params = []) => (await client.query(text, params)).rows.map(fixInts));
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

// The Neon driver returns int8 as strings; normalise the known millisecond columns.
const INT_COLS = new Set(['created_at', 'updated_at', 'expires_at', 'scheduled_at', 'published_at', 'token_expires_at', 'last_used_at', 'accepted_at', 'size', 'c']);
function fixInts(row: any) {
  for (const k in row) if (INT_COLS.has(k) && typeof row[k] === 'string') row[k] = Number(row[k]);
  return row;
}

export const now = () => Date.now();
export const uid = (prefix = '') =>
  prefix + (prefix ? '_' : '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
