import { test } from 'node:test';
import assert from 'node:assert/strict';
import { facebook, instagram } from '../lib/server/adapters/oauth.ts';

const params = (url: string) => new URL(url).searchParams;

test('Meta login asks for the Page and Instagram permissions by default', () => {
  process.env.FACEBOOK_APP_ID = '123';
  delete process.env.FACEBOOK_CONFIG_ID;
  const fb = params(facebook.getAuthUrl!({ state: 's', redirectUri: 'https://x.test/cb' } as any) as string);
  assert.equal(fb.get('client_id'), '123');
  assert.match(fb.get('scope')!, /pages_manage_posts/);
  const ig = params(instagram.getAuthUrl!({ state: 's', redirectUri: 'https://x.test/cb' } as any) as string);
  for (const p of ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement', 'pages_show_list']) assert.match(ig.get('scope')!, new RegExp(p));
});

test('a Facebook Login for Business configuration replaces the scope list', () => {
  process.env.FACEBOOK_APP_ID = '123';
  process.env.FACEBOOK_CONFIG_ID = '999';
  const fb = params(facebook.getAuthUrl!({ state: 's', redirectUri: 'https://x.test/cb' } as any) as string);
  assert.equal(fb.get('config_id'), '999');
  assert.equal(fb.get('scope'), null);
  delete process.env.FACEBOOK_CONFIG_ID;
});

test('fresh profile pictures come from the Page picture edge and the Instagram profile field', async () => {
  const { freshMetaAvatar } = await import('../lib/server/adapters/oauth.ts');
  const real = globalThis.fetch;
  const seen: string[] = [];
  globalThis.fetch = (async (url: string) => {
    seen.push(String(url));
    const body = String(url).includes('/picture?') ? { data: { url: 'https://cdn.test/fb.jpg' } } : { profile_picture_url: 'https://cdn.test/ig.jpg' };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as any;
  try {
    assert.equal(await freshMetaAvatar({ platform: 'facebook', external_id: '42', access_token: 'tok' }), 'https://cdn.test/fb.jpg');
    assert.equal(await freshMetaAvatar({ platform: 'instagram', external_id: '17', access_token: 'tok' }), 'https://cdn.test/ig.jpg');
    assert.equal(await freshMetaAvatar({ platform: 'x', external_id: '1', access_token: 'tok' }), null);
    assert.equal(await freshMetaAvatar({ platform: 'facebook', external_id: '42', access_token: null }), null);
    assert.match(seen[0], /\/42\/picture\?redirect=0/);
    assert.match(seen[1], /\/17\?fields=profile_picture_url/);
    assert.equal(seen.length, 2);
  } finally {
    globalThis.fetch = real;
  }
});
