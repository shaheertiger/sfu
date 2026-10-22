import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { sign } from '../lib/server/webhooks.ts';

test('signature matches the documented scheme', () => {
  const body = '{"event":"ping"}';
  const sig = sign('whsec_test', body, 1700000000);
  const expected = crypto.createHmac('sha256', 'whsec_test').update(`1700000000.${body}`).digest('hex');
  assert.equal(sig, `t=1700000000,v1=${expected}`);
});
