import { test } from 'node:test';
import assert from 'node:assert/strict';
import { facebook, instagram, metaPages, threads } from '../lib/server/adapters/oauth.ts';
import { PublishError, withDeadline } from '../lib/server/adapters/types.ts';
import { facebookMixProblem, nonJpegImages } from '../lib/server/meta-format.ts';

type Call = { method: string; url: string; body: string };

/** Replaces fetch with `route(call)`, recording every call. */
async function withFetch(route: (c: Call) => any, fn: (calls: Call[]) => Promise<void>) {
  const real = globalThis.fetch;
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string, init: any = {}) => {
    const c = { method: init.method || 'GET', url: String(url), body: typeof init.body === 'string' ? init.body : init.body ? '[binary]' : '' };
    calls.push(c);
    const out = await route(c);
    if (out instanceof Response) return out;
    return new Response(JSON.stringify(out ?? {}), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as any;
  try {
    await fn(calls);
  } finally {
    globalThis.fetch = real;
  }
}

const file = (id: string, mime: string) => ({ id, key: id, url: `https://cdn.test/${id}`, mime, size: 10, filename: `${id}.${mime.split('/')[1]}`, bytes: async () => Buffer.from('x') });
const account = (platform: string, meta: Record<string, any> = {}) => ({
  id: 'acc', workspace_id: 'ws', platform, external_id: '1789', username: 'harbor', display_name: 'Harbor', avatar_url: null,
  access_token: 'tok', refresh_token: null, token_expires_at: null, meta, status: 'active',
}) as any;

/** Runs `fn` with so little time left that Instagram's processing wait gives up after one check. */
const shortRun = <T>(fn: () => Promise<T>) => withDeadline(Date.now() + 20_000, fn);

test('every Facebook Page is found: /me/accounts is read 100 at a time, following paging.next', async () => {
  let n = 0;
  await withFetch((c) => {
    n++;
    const page = (ids: string[], next?: string) => ({ data: ids.map((id) => ({ id, name: id })), paging: next ? { next } : {} });
    if (c.url.endsWith('after=A')) return page(['p3'], 'https://graph.facebook.com/v21.0/me/accounts?after=B');
    if (c.url.endsWith('after=B')) return page(['p4']);
    return page(['p1', 'p2'], 'https://graph.facebook.com/v21.0/me/accounts?after=A');
  }, async (calls) => {
    const pages = await metaPages('id,name', 'user-token');
    assert.deepEqual(pages.map((p) => p.id), ['p1', 'p2', 'p3', 'p4']);
    assert.match(calls[0].url, /limit=100/);
  });
  assert.equal(n, 3);
});

test('connecting keeps Page tokens only: no user token is stored, and Instagram publishes with the Page token', async () => {
  const route = (c: Call) => {
    if (c.url.includes('/oauth/access_token')) return { access_token: c.url.includes('fb_exchange_token') ? 'long-user' : 'short-user' };
    if (c.url.includes('/me/accounts')) {
      return { data: [{ id: 'page1', name: 'Harbor', access_token: 'page-token', picture: { data: { url: 'https://cdn.test/p.jpg' } }, instagram_business_account: { id: 'ig1', username: 'harbor' } }] };
    }
  };
  await withFetch(route, async () => {
    const [fb] = await facebook.exchangeCode!({ code: 'c', redirectUri: 'https://x.test/cb' });
    assert.equal(fb.access_token, 'page-token');
    assert.deepEqual(fb.meta, { token_kind: 'page' });
    assert.ok(!JSON.stringify(fb).includes('long-user'));
    const [ig] = await instagram.exchangeCode!({ code: 'c', redirectUri: 'https://x.test/cb' });
    assert.equal(ig.access_token, 'page-token');
    assert.equal(ig.token_expires_at, undefined);
    assert.deepEqual(ig.meta, { page_id: 'page1', token_kind: 'page' });
  });
});

test('an old Instagram user token is swapped for the linked Page token', async () => {
  await withFetch((c) => (c.url.includes('/page1?') ? { access_token: 'page-token', id: 'page1' } : {}), async (calls) => {
    const upd = await instagram.refresh!(account('instagram', { page_id: 'page1' }));
    assert.equal(upd.access_token, 'page-token');
    assert.equal(upd.meta?.token_kind, 'page');
    assert.match(calls[0].url, /fields=access_token/);
  });
});

test('Threads renews its token with the token itself (th_refresh_token)', async () => {
  await withFetch(() => ({ access_token: 'new', expires_in: 5_184_000 }), async (calls) => {
    const upd = await threads.refresh!(account('threads'));
    assert.equal(upd.access_token, 'new');
    assert.ok(upd.token_expires_at! > Date.now() + 59 * 864e5);
    assert.match(calls[0].url, /^https:\/\/graph\.threads\.net\/refresh_access_token\?grant_type=th_refresh_token&access_token=tok$/);
  });
});

test('Instagram: a slow video is handed to the next attempt, which reuses the container instead of uploading again', async () => {
  let status = 'IN_PROGRESS';
  let saved: Record<string, any> = {};
  const save = async (patch: Record<string, any>) => { saved = { ...saved, ...patch }; };
  let sent = 0;
  const route = (c: Call) => {
    if (c.method === 'POST' && c.url.endsWith('/1789/media')) return { id: 'cont1' };
    if (c.url.includes('/cont1?fields=status_code')) return { status_code: status };
    if (c.url.endsWith('/media_publish')) return { id: 'media9' };
    if (c.url.includes('/media9?fields=permalink')) return { permalink: 'https://www.instagram.com/reel/abc/' };
  };
  const input = { account: account('instagram'), caption: 'Hi', media: [file('v1', 'video/mp4')], options: {}, save, sending: async () => { sent++; } };
  await withFetch(route, async (calls) => {
    await assert.rejects(() => shortRun(() => instagram.publish({ ...input, progress: {} })), (e: any) => e instanceof PublishError && e.processing === true && e.retryable);
    assert.equal(saved.ig.container, 'cont1');
    assert.equal(sent, 0);
    status = 'FINISHED';
    const r = await shortRun(() => instagram.publish({ ...input, progress: saved }));
    assert.deepEqual(r, { externalId: 'media9', url: 'https://www.instagram.com/reel/abc/' });
    assert.equal(calls.filter((c) => c.method === 'POST' && c.url.endsWith('/media')).length, 1, 'the container is made once');
    assert.equal(sent, 1);
  });
});

test('Instagram carousels wait for video items to finish before the carousel container is made', async () => {
  const states: Record<string, string> = { c1: 'FINISHED', c2: 'IN_PROGRESS', car: 'FINISHED' };
  let saved: Record<string, any> = {};
  let made = 0;
  const route = (c: Call) => {
    if (c.method === 'POST' && c.url.endsWith('/1789/media')) {
      if (c.body.includes('CAROUSEL')) return { id: 'car' };
      return { id: ++made === 1 ? 'c1' : 'c2' };
    }
    const m = /\/(\w+)\?fields=status_code/.exec(c.url);
    if (m) return { status_code: states[m[1]] };
    if (c.url.endsWith('/media_publish')) return { id: 'm1' };
    return { permalink: 'https://www.instagram.com/p/x/' };
  };
  const input = { account: account('instagram'), caption: 'Hi', media: [file('i1', 'image/jpeg'), file('v1', 'video/mp4')], options: {}, save: async (p: any) => { saved = { ...saved, ...p }; } };
  await withFetch(route, async (calls) => {
    await assert.rejects(() => shortRun(() => instagram.publish({ ...input, progress: {} })), (e: any) => e.processing === true);
    assert.deepEqual(saved.ig.children, ['c1', 'c2']);
    assert.ok(!calls.some((c) => c.body.includes('CAROUSEL')), 'no carousel container while a video item is processing');
    assert.ok(!calls.some((c) => c.url.includes('/c1?')), 'image items are not polled');
    states.c2 = 'FINISHED';
    const r = await shortRun(() => instagram.publish({ ...input, progress: saved }));
    assert.equal(r.externalId, 'm1');
    assert.equal(calls.filter((c) => c.method === 'POST' && c.url.endsWith('/1789/media')).length, 3, 'two items and one carousel, each made once');
  });
});

test('Instagram refuses non-JPEG images before uploading anything', async () => {
  await withFetch(() => ({}), async (calls) => {
    await assert.rejects(
      () => instagram.publish({ account: account('instagram'), caption: '', media: [file('a', 'image/png')], options: {} }),
      (e: any) => e instanceof PublishError && !e.retryable && /only accepts JPEG/.test(e.message),
    );
    assert.equal(calls.length, 0);
  });
  assert.deepEqual(nonJpegImages([file('a', 'image/jpeg'), file('b', 'image/webp'), file('c', 'video/mp4')]).map((m) => m.id), ['b']);
});

test('Facebook videos are uploaded by URL, and a post with both a video and images is refused', async () => {
  await withFetch((c) => (c.url.includes('/videos') ? { id: 'vid1' } : {}), async (calls) => {
    const r = await facebook.publish({ account: account('facebook'), caption: 'Clip', media: [file('v1', 'video/mp4')], options: {} });
    assert.equal(r.externalId, 'vid1');
    assert.equal(calls.length, 1);
    const body = new URLSearchParams(calls[0].body);
    assert.equal(body.get('file_url'), 'https://cdn.test/v1');
    assert.equal(body.get('description'), 'Clip');
    await assert.rejects(
      () => facebook.publish({ account: account('facebook'), caption: '', media: [file('v1', 'video/mp4'), file('i1', 'image/jpeg')], options: {} }),
      (e: any) => e instanceof PublishError && !e.retryable && /video or images, not both/.test(e.message),
    );
  });
  assert.equal(facebookMixProblem([{ mime: 'image/jpeg' }, { mime: 'image/png' }]), null);
  assert.match(facebookMixProblem([{ mime: 'video/mp4' }, { mime: 'image/png' }])!, /not both/);
});
