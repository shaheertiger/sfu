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
