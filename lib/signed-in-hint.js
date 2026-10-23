/**
 * A readable "signed in" hint so static marketing pages can show "Open dashboard" instead of
 * "Sign in". It holds no session data and grants nothing: the real session cookie is httpOnly,
 * and the dashboard still checks it. Set at sign-in and on dashboard loads, cleared at sign-out.
 */
export const SIGNED_IN_HINT = 'sfy_signed_in';
export const SIGNED_IN_HINT_MAX_AGE = 30 * 24 * 60 * 60;

/** Browser only. */
export function hasSignedInHint() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${SIGNED_IN_HINT}=1`));
}
