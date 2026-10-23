/** Turns Neon Auth's password reset errors into instructions a person can act on. Browser-safe. */
export const RESET_EXPIRED = 'This reset link has expired or was already used. Request a new one.';

export function resetErrorMessage(error) {
  const text = `${error?.code || ''} ${error?.message || ''}`;
  if (/INVALID_TOKEN|expired|invalid token/i.test(text)) return RESET_EXPIRED;
  if (/PASSWORD_TOO_SHORT|too short/i.test(text)) return 'Use a password of at least 8 characters.';
  if (/PASSWORD_TOO_LONG|too long/i.test(text)) return 'That password is too long.';
  if (/TOO_MANY|rate/i.test(text)) return 'Too many attempts. Wait a few minutes and try again.';
  return 'Something went wrong. Request a new link and try again.';
}
