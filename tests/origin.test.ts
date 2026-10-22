import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertSameOrigin } from '../lib/server/origin.ts';
import { HttpError } from '../lib/server/http-error.ts';

const req = (method: string, headers: Record<string, string>) => new Request('https://scheduleforyou.com/api/v1/posts', { method, headers });

test('reads never need an origin', () => {
  assertSameOrigin(req('GET', { origin: 'https://evil.example' }));
});

test('writes from our own origin pass', () => {
  assertSameOrigin(req('POST', { host: 'scheduleforyou.com', origin: 'https://scheduleforyou.com' }));
  assertSameOrigin(req('DELETE', { host: 'internal', 'x-forwarded-host': 'scheduleforyou.com', origin: 'https://scheduleforyou.com' }));
});

test('writes without an Origin header (curl, servers) pass', () => {
  assertSameOrigin(req('POST', { host: 'scheduleforyou.com' }));
});

test('cross-site writes are refused with 403', () => {
  for (const origin of ['https://evil.example', 'null', 'not a url', 'https://scheduleforyou.com.evil.example']) {
    assert.throws(() => assertSameOrigin(req('POST', { host: 'scheduleforyou.com', origin })), (e: any) => e instanceof HttpError && e.status === 403);
  }
});
