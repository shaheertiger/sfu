import { test } from 'node:test';
import assert from 'node:assert/strict';
import { explicitSslMode } from '../lib/pg-url.js';

const NEON = 'postgresql://u:p@ep-x-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

test('Neon sslmode=require becomes verify-full, other params kept', () => {
  const u = new URL(explicitSslMode(NEON));
  assert.equal(u.searchParams.get('sslmode'), 'verify-full');
  assert.equal(u.searchParams.get('channel_binding'), 'require');
  assert.equal(u.hostname, 'ep-x-pooler.us-east-2.aws.neon.tech');
  assert.equal(u.username, 'u');
});

test('prefer and verify-ca are aliases too', () => {
  for (const m of ['prefer', 'verify-ca']) assert.match(explicitSslMode(`postgres://h/db?sslmode=${m}`), /sslmode=verify-full/);
});

test('leaves other modes, libpq-compat URLs and missing/odd input alone', () => {
  for (const url of ['postgres://h/db', 'postgres://h/db?sslmode=disable', 'postgres://h/db?sslmode=verify-full', 'postgres://h/db?uselibpqcompat=true&sslmode=require', 'not a url', '']) {
    assert.equal(explicitSslMode(url), url);
  }
  assert.equal(explicitSslMode(undefined), undefined);
});
