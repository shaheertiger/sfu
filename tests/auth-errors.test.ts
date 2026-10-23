import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RESET_EXPIRED, resetErrorMessage } from '../lib/auth-errors.js';

test('password reset errors read as plain instructions', () => {
  assert.equal(resetErrorMessage({ code: 'INVALID_TOKEN', message: 'Invalid token' }), RESET_EXPIRED);
  assert.match(resetErrorMessage({ code: 'PASSWORD_TOO_SHORT' }), /8 characters/);
  assert.match(resetErrorMessage({ code: 'TOO_MANY_REQUESTS' }), /Too many/);
  assert.match(resetErrorMessage(null), /Request a new link/);
});

test('only server, network, timeout and rate-limit failures count as a temporary sign-in problem', async () => {
  const { isTransientAuthError } = await import('../lib/auth-errors.js');
  for (const s of [undefined, 0, 500, 502, 503, 408, 429]) assert.equal(isTransientAuthError(s as any), true, String(s));
  for (const s of [400, 401, 403, 404]) assert.equal(isTransientAuthError(s), false, String(s));
});
