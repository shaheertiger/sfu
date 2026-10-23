import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RESET_EXPIRED, resetErrorMessage } from '../lib/auth-errors.js';

test('password reset errors read as plain instructions', () => {
  assert.equal(resetErrorMessage({ code: 'INVALID_TOKEN', message: 'Invalid token' }), RESET_EXPIRED);
  assert.match(resetErrorMessage({ code: 'PASSWORD_TOO_SHORT' }), /8 characters/);
  assert.match(resetErrorMessage({ code: 'TOO_MANY_REQUESTS' }), /Too many/);
  assert.match(resetErrorMessage(null), /Request a new link/);
});
