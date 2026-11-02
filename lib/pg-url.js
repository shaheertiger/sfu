/**
 * node-postgres currently treats sslmode=prefer/require/verify-ca as verify-full and logs a
 * "SECURITY WARNING" on every new connection saying so (Neon URLs use sslmode=require). Spell
 * out verify-full ourselves: same behaviour today, no warning, and no silent downgrade to libpq
 * semantics when pg v9 changes what "require" means.
 */
const ALIASES = new Set(['prefer', 'require', 'verify-ca']);

export function explicitSslMode(url) {
  if (!url) return url;
  let u;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const mode = u.searchParams.get('sslmode');
  if (!mode || !ALIASES.has(mode) || u.searchParams.has('uselibpqcompat')) return url;
  u.searchParams.set('sslmode', 'verify-full');
  return u.toString();
}
