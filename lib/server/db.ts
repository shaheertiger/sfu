import 'server-only';
import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';

/**
 * Postgres access with node-postgres, as Neon recommends for Vercel (Fluid compute):
 * one pool per function instance over Neon's pooled (-pooler) DATABASE_URL, and
 * attachDatabasePool so Vercel closes idle connections before an instance is suspended.
 */
declare global {
  // eslint-disable-next-line no-var
  var __sfyPool: pg.Pool | undefined;
}

// BIGINT (int8) columns hold epoch milliseconds; return them as numbers.
pg.types.setTypeParser(20, (v: string) => Number(v));

function makePool(): pg.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const p = new pg.Pool({ connectionString: url, max: 5, idleTimeoutMillis: 5_000 });
  attachDatabasePool(p);
  return p;
}

export function pool(): pg.Pool {
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
const INT_COLS = new Set(['created_at', 'updated_at', 'expires_at', 'scheduled_at', 'published_at', 'token_expires_at', 'last_used_at', 'accepted_at', 'size', 'c', 'repeat_anchor', 'failed_at']);
function fixInts(row: any) {
  for (const k in row) if (INT_COLS.has(k) && typeof row[k] === 'string') row[k] = Number(row[k]);
  return row;
}

export const now = () => Date.now();
export const uid = (prefix = '') =>
  prefix + (prefix ? '_' : '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
