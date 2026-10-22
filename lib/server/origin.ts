import { HttpError } from './http-error';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cookie-authenticated writes must come from our own origin. Browsers send `Origin` on every
 * cross-site request (and on same-site POSTs), so a mismatch is a cross-site request forgery
 * attempt. Requests without an Origin header (curl, server-to-server) are left alone; API keys
 * are checked separately because a Bearer token can't be forged by another site.
 */
export function assertSameOrigin(req: Request) {
  if (SAFE_METHODS.has(req.method)) return;
  const origin = req.headers.get('origin');
  if (origin === null) return;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    throw new HttpError(403, 'Cross-site request blocked');
  }
  const allowed = [req.headers.get('x-forwarded-host'), req.headers.get('host')]
    .filter((h): h is string => !!h)
    .map((h) => h.split(',')[0].trim());
  if (!allowed.includes(host)) throw new HttpError(403, 'Cross-site request blocked');
}
