// Applies db/migrations/*.sql in order, once each. Runs before `next build`.
// Skips quietly when DATABASE_URL isn't set (e.g. a build without a database).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Local runs: read .env.local like Next.js does (Vercel provides real env vars).
const envFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.log('[migrate] DATABASE_URL not set, skipping migrations');
  process.exit(0);
}
let pool;
if (/\.neon\.tech/.test(url)) {
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: url });
} else {
  pool = new pg.Pool({ connectionString: url });
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const client = await pool.connect();
try {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at BIGINT NOT NULL)');
  // One migrator at a time (parallel preview builds).
  await client.query('SELECT pg_advisory_lock(727274)');
  const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('[migrate] applying', f);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name, applied_at) VALUES ($1, $2)', [f, Date.now()]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }
  await client.query('SELECT pg_advisory_unlock(727274)');
  console.log('[migrate] up to date');
} finally {
  client.release();
  await pool.end();
}
