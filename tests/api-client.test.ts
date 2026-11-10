import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../lib/api-client.js';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Replaces fetch with a script: each entry is a status to answer with, or 'net' for a dropped connection. */
function script(steps: (number | 'net')[]) {
  const calls: { url: string; method: string }[] = [];
  globalThis.fetch = (async (url: string, init: any) => {
    calls.push({ url, method: init?.method || 'GET' });
    const step = steps.shift() ?? 200;
    if (step === 'net') throw new TypeError('Failed to fetch');
    return new Response(JSON.stringify(step < 400 ? { ok: true } : { error: `status ${step}` }), {
      status: step,
      headers: { 'content-type': 'application/json' },
    });
  }) as any;
  return calls;
}

test('a save that hits a dropped connection is retried and succeeds', async () => {
  const calls = script(['net', 200]);
  assert.deepEqual(await api('/api/app/posts/p1', { method: 'PUT', body: { caption: 'hi' } }), { ok: true });
  assert.equal(calls.length, 2);
});

test('brief server errors (502/503/504) are retried for reads', async () => {
  const calls = script([503, 502, 200]);
  assert.deepEqual(await api('/api/app/state'), { ok: true });
  assert.equal(calls.length, 3);
});

test('publish now is never repeated: a second try could post twice', async () => {
  const calls = script(['net', 200]);
  await assert.rejects(api('/api/app/posts/p1', { method: 'PUT', body: { publish_now: true } }), /reach the server|offline/);
  assert.equal(calls.length, 1);
});

test('a POST is never repeated', async () => {
  const calls = script([503, 200]);
  await assert.rejects(api('/api/v1/keys', { method: 'POST', body: { name: 'k' } }), /status 503/);
  assert.equal(calls.length, 1);
});

test('errors the request itself caused are not retried, and keep their status', async () => {
  const calls = script([422]);
  await assert.rejects(api('/api/app/posts/p1', { method: 'PUT', body: {} }), (e: any) => e.status === 422 && /status 422/.test(e.message));
  assert.equal(calls.length, 1);
});

test('a dropped connection that never recovers gives a plain message, not "Failed to fetch"', async () => {
  const calls = script(['net', 'net', 'net']);
  await assert.rejects(api('/api/app/state'), (e: any) => !/Failed to fetch/.test(e.message) && e.status === undefined);
  assert.equal(calls.length, 3);
});

test('a DELETE whose answer was lost counts as done when the retry finds nothing', async () => {
  const calls = script(['net', 404]);
  assert.deepEqual(await api('/api/app/posts/p1', { method: 'DELETE' }), {});
  assert.equal(calls.length, 2);
});
