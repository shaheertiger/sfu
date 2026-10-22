import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicUrl, isPrivateIp } from '../lib/server/safe-url.ts';
import { HttpError } from '../lib/server/http-error.ts';

const refused = async (url: string) => {
  await assert.rejects(assertPublicUrl(url), (e: any) => e instanceof HttpError && e.status === 400, url);
};

test('refuses non-https, credentials and local names', async () => {
  delete process.env.ALLOW_PRIVATE_URLS;
  await refused('http://example.com/hook');
  await refused('ftp://example.com/hook');
  await refused('not a url');
  await refused('https://user:pw@example.com/hook');
  await refused('https://localhost/hook');
  await refused('https://db.internal/hook');
  await refused('https://printer.local/hook');
});

test('refuses private, loopback, link-local and metadata addresses', async () => {
  delete process.env.ALLOW_PRIVATE_URLS;
  for (const ip of ['10.0.0.1', '127.0.0.1', '0.0.0.0', '169.254.169.254', '172.16.5.5', '172.31.255.255', '192.168.1.1', '100.64.0.1', '224.0.0.1', '255.255.255.255', '[::1]', '[::]', '[fd00::1]', '[fe80::1]', '[febf::1]', '[::ffff:10.0.0.1]', '[::ffff:a9fe:a9fe]', '[64:ff9b::a9fe:a9fe]', '[2002:a00:1::]']) {
    await refused(`https://${ip}/hook`);
  }
});

test('classifies raw addresses, including IPv6 forms that embed IPv4', () => {
  for (const ip of ['::ffff:169.254.169.254', '::ffff:a9fe:a9fe', '64:ff9b::7f00:1', '2002:c0a8:101::', 'fc00::1', 'fe90::1', 'ff02::1', '::', '::1', '2001:db8::1', 'fe80::1%eth0', 'garbage']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111', '::ffff:8.8.8.8', '2002:0808:0808::']) {
    assert.equal(isPrivateIp(ip), false, ip);
  }
});

test('accepts public addresses', async () => {
  delete process.env.ALLOW_PRIVATE_URLS;
  const u = await assertPublicUrl('https://8.8.8.8/hook');
  assert.equal(u.hostname, '8.8.8.8');
  assert.equal((await assertPublicUrl('https://172.32.0.1/hook')).hostname, '172.32.0.1');
});

test('ALLOW_PRIVATE_URLS=1 lifts the check for local testing', async () => {
  process.env.ALLOW_PRIVATE_URLS = '1';
  try {
    assert.equal((await assertPublicUrl('http://localhost:3000/hook')).port, '3000');
  } finally {
    delete process.env.ALLOW_PRIVATE_URLS;
  }
});
