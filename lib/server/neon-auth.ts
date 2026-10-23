import 'server-only';
import { createNeonAuth, type NeonAuth } from '@neondatabase/auth/next/server';
import { HttpError } from './http-error';

/**
 * Neon Auth (Managed Better Auth). Created on first use so builds without the env vars still work.
 * NEON_AUTH_BASE_URL: the branch's Auth URL (Neon Console → Auth, or `neon env pull`).
 * NEON_AUTH_COOKIE_SECRET: 32+ random characters (`openssl rand -base64 32`).
 */
let instance: NeonAuth | null = null;
export function neonAuth(): NeonAuth {
  if (instance) return instance;
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) throw new HttpError(503, 'Sign-in is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.');
  // The signed session cache cookie saves a round trip to Neon Auth on every request. 30 minutes
  // (default 5) means fewer upstream checks, so a briefly slow auth server rarely matters.
  instance = createNeonAuth({ baseUrl, cookies: { secret, sessionDataTtl: 30 * 60 } });
  return instance;
}
