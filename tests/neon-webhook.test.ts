import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { expiresIn, handleNeonAuthWebhook, jwksKeyResolver, memoryEventStore, type WebhookDeps } from '../lib/server/neon-webhook.ts';
import { layout, type Email } from '../lib/server/email.ts';

const NOW = Date.parse('2026-10-23T12:00:00.000Z');
const KID = 'test-kid-1';
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

/** Signs a body exactly as Neon does: detached JWS over base64url(timestamp + "." + base64url(body)). */
function neonHeaders(body: string, opts: { kid?: string; timestamp?: number; key?: crypto.KeyObject; eventId?: string } = {}) {
  const ts = String(opts.timestamp ?? NOW);
  const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWS', kid: opts.kid ?? KID })).toString('base64url');
  const payload = Buffer.from(`${ts}.${Buffer.from(body, 'utf8').toString('base64url')}`, 'utf8').toString('base64url');
  const sig = crypto.sign(null, Buffer.from(`${header}.${payload}`), opts.key ?? privateKey).toString('base64url');
  return new Headers({
    'content-type': 'application/json',
    'x-neon-signature': `${header}..${sig}`,
    'x-neon-signature-kid': opts.kid ?? KID,
    'x-neon-timestamp': ts,
    'x-neon-event-type': 'send.magic_link',
    'x-neon-event-id': opts.eventId ?? 'evt-1',
    'x-neon-delivery-attempt': '1',
  });
}

function event(linkType: string, overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    event_id: 'evt-1',
    event_type: 'send.magic_link',
    timestamp: new Date(NOW).toISOString(),
    context: { endpoint_id: 'ep-test', project_name: 'Schedule For You' },
    user: { id: 'u1', email: 'jane@example.com', name: 'Jane <b>Smith</b>', email_verified: true },
    event_data: {
      link_type: linkType,
      link_url: `https://ep-test.neonauth.example.tech/neondb/auth/${linkType}/abc?callbackURL=x`,
      token: 'tok+/= &?#',
      expires_at: new Date(NOW + 15 * 60_000).toISOString(),
      ip_address: '192.0.2.1',
      user_agent: 'Mozilla/5.0',
    },
    ...overrides,
  });
}

function deps(extra: Partial<WebhookDeps> = {}) {
  const sent: Email[] = [];
  const d: Partial<WebhookDeps> = {
    resolveKey: async (kid) => (kid === KID ? publicKey : null),
    store: memoryEventStore(),
    send: async (m) => void sent.push(m),
    emailReady: () => true,
    siteUrl: () => 'https://scheduleforyou.com',
    now: () => NOW,
    ...extra,
  };
  return { d, sent };
}

test('valid signature: the reset email links to our /reset-password with the token URL-encoded', async () => {
  const { d, sent } = deps();
  const body = event('forget-password');
  const r = await handleNeonAuthWebhook(body, neonHeaders(body), d);
  assert.equal(r.status, 200);
  assert.equal(sent.length, 1);
  const m = sent[0];
  assert.equal(m.to, 'jane@example.com');
  assert.equal(m.subject, 'Reset your Schedule For You password');
  const link = `https://scheduleforyou.com/reset-password?token=${encodeURIComponent('tok+/= &?#')}`;
  assert.equal(link, 'https://scheduleforyou.com/reset-password?token=tok%2B%2F%3D%20%26%3F%23');
  assert.ok(m.text.includes(link));
  assert.ok(m.html.includes(`href="${link}"`));
  assert.ok(!m.html.includes('neonauth'), 'never links to Neon');
  assert.ok(m.text.includes('expires in 15 minutes'));
  // Names are escaped; the Settings footer is replaced.
  assert.ok(m.html.includes('Jane &lt;b&gt;Smith&lt;/b&gt;'));
  assert.ok(!m.html.includes('<b>Smith'));
  assert.ok(!m.html.includes('Turn these emails on or off'));
  assert.ok(m.html.includes('asked to reset the password for this address'));
});

test('email-verification and sign-in use link_url as-is', async () => {
  for (const [type, subject] of [['email-verification', 'Confirm your email for Schedule For You'], ['sign-in', 'Your Schedule For You sign-in link']]) {
    const { d, sent } = deps();
    const body = event(type, { event_id: `evt-${type}` });
    const r = await handleNeonAuthWebhook(body, neonHeaders(body), d);
    assert.equal(r.status, 200);
    assert.equal(sent[0].subject, subject);
    assert.ok(sent[0].text.includes(`https://ep-test.neonauth.example.tech/neondb/auth/${type}/abc?callbackURL=x`));
  }
});

test('tampered body is rejected', async () => {
  const { d, sent } = deps();
  const body = event('forget-password');
  const tampered = body.replace('jane@example.com', 'evil@example.com');
  const r = await handleNeonAuthWebhook(tampered, neonHeaders(body), d);
  assert.equal(r.status, 401);
  assert.equal(sent.length, 0);
});

test('unknown kid, wrong key and malformed signatures are rejected', async () => {
  const { d, sent } = deps();
  const body = event('forget-password');
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body, { kid: 'other-kid' }), d)).status, 401);
  const other = crypto.generateKeyPairSync('ed25519').privateKey;
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body, { key: other }), d)).status, 401);
  const h = neonHeaders(body);
  h.set('x-neon-signature', h.get('x-neon-signature')!.replace('..', '.x.'));
  assert.equal((await handleNeonAuthWebhook(body, h, d)).status, 401);
  const none = new Headers({ 'content-type': 'application/json' });
  assert.equal((await handleNeonAuthWebhook(body, none, d)).status, 401);
  assert.equal(sent.length, 0);
});

test('stale or future timestamps are rejected', async () => {
  const { d, sent } = deps();
  const body = event('forget-password');
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body, { timestamp: NOW - 6 * 60_000 }), d)).status, 401);
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body, { timestamp: NOW + 6 * 60_000 }), d)).status, 401);
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body, { timestamp: NOW - 4 * 60_000 }), d)).status, 200);
  assert.equal(sent.length, 1);
});

test('a duplicate event id is ignored', async () => {
  const { d, sent } = deps();
  const body = event('forget-password');
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body), d)).status, 200);
  const again = await handleNeonAuthWebhook(body, neonHeaders(body), d);
  assert.equal(again.status, 200);
  assert.equal(again.body.duplicate, true);
  assert.equal(sent.length, 1);
});

test('a failed send answers 5xx and is retried', async () => {
  let calls = 0;
  const { d, sent } = deps({
    send: async (m) => {
      if (++calls === 1) throw new Error('Resend 500');
      sent.push(m);
    },
  });
  const body = event('forget-password');
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body), d)).status, 502);
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body), d)).status, 200);
  assert.equal(sent.length, 1);
});

test('without Resend configured the webhook answers 500', async () => {
  const { d, sent } = deps({ emailReady: () => false });
  const body = event('forget-password');
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body), d)).status, 500);
  assert.equal(sent.length, 0);
});

test('other events and unknown link types are acknowledged and ignored', async () => {
  const { d, sent } = deps();
  const created = JSON.stringify({ event_id: 'evt-2', event_type: 'user.created', user: { email: 'a@b.co' }, event_data: {} });
  assert.equal((await handleNeonAuthWebhook(created, neonHeaders(created), d)).status, 200);
  const odd = event('something-new', { event_id: 'evt-3' });
  const r = await handleNeonAuthWebhook(odd, neonHeaders(odd), d);
  assert.equal(r.status, 200);
  assert.equal(r.body.ignored, true);
  assert.equal(sent.length, 0);
});

test('JWKS resolver caches keys and refetches on an unknown kid', async () => {
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: KID, alg: 'EdDSA', use: 'sig' };
  let fetches = 0, t = NOW;
  const fakeFetch = (async () => {
    fetches++;
    return new Response(JSON.stringify({ keys: [jwk] }), { headers: { 'content-type': 'application/json' } });
  }) as unknown as typeof fetch;
  const resolve = jwksKeyResolver(() => 'https://auth.example/.well-known/jwks.json', fakeFetch, () => t);
  assert.ok(await resolve(KID));
  assert.ok(await resolve(KID));
  assert.equal(fetches, 1);
  assert.equal(await resolve('new-kid'), null); // within 10 s of the last fetch: no refetch
  assert.equal(fetches, 1);
  t += 11_000;
  assert.equal(await resolve('new-kid'), null);
  assert.equal(fetches, 2);

  // End to end with the resolver.
  const { d, sent } = deps({ resolveKey: resolve });
  const body = event('forget-password', { event_id: 'evt-jwks' });
  assert.equal((await handleNeonAuthWebhook(body, neonHeaders(body), d)).status, 200);
  assert.equal(sent.length, 1);
});

test('expiry wording', () => {
  assert.equal(expiresIn(new Date(NOW + 15 * 60_000).toISOString(), NOW), '15 minutes');
  assert.equal(expiresIn(new Date(NOW + 60 * 60_000).toISOString(), NOW), '1 hour');
  assert.equal(expiresIn(new Date(NOW + 3 * 86400_000).toISOString(), NOW), '3 days');
  assert.equal(expiresIn(new Date(NOW - 1000).toISOString(), NOW), null);
  assert.equal(expiresIn(undefined, NOW), null);
});

test('layout keeps the Settings footer by default and can replace or drop it', () => {
  assert.ok(layout('T', '<p>b</p>').includes('Turn these emails on or off in Settings.'));
  const custom = layout('T', '<p>b</p>', undefined, { footer: 'Because <you> asked.' });
  assert.ok(custom.includes('Because &lt;you&gt; asked.'));
  assert.ok(!custom.includes('Turn these emails'));
  assert.ok(!layout('T', '<p>b</p>', undefined, { footer: null }).includes('Turn these emails'));
});
