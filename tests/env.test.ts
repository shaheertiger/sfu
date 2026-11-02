import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readEnv } from '../lib/server/env.ts';

test('exact name wins', () => {
  assert.equal(readEnv('X_CLIENT_ID', { X_CLIENT_ID: 'right', X_Client_ID: 'wrong' }), 'right');
});

test('different capitalisation is accepted (X_Client_ID on Vercel)', () => {
  assert.equal(readEnv('X_CLIENT_ID', { X_Client_ID: 'abc' }), 'abc');
  assert.equal(readEnv('X_CLIENT_SECRET', { X_Client_Secret: 'shh' }), 'shh');
});

test("provider names are accepted (Pinterest client id, a key saved as 'Resend')", () => {
  assert.equal(readEnv('PINTEREST_APP_ID', { PINTEREST_CLIENT_ID: 'p1' }), 'p1');
  assert.equal(readEnv('PINTEREST_APP_SECRET', { PINTEREST_CLIENT_SECRET: 'p2' }), 'p2');
  assert.equal(readEnv('RESEND_API_KEY', { Resend: 're_123' }), 're_123');
});

test('missing or empty gives an empty string', () => {
  assert.equal(readEnv('X_CLIENT_ID', {}), '');
  assert.equal(readEnv('X_CLIENT_ID', { X_CLIENT_ID: '', x_client_id: '' }), '');
  assert.equal(readEnv('RESEND_API_KEY', { RESEND_API_KEY: '', Resend: 'fallback' }), 'fallback');
});
