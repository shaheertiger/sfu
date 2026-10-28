import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkedin } from '../lib/server/adapters/oauth.ts';
import { PublishError, withDeadline } from '../lib/server/adapters/types.ts';

type Call = { method: string; url: string; body: any; headers: Record<string, string>; size: number };

/** Replaces fetch with `route(call)`, recording every call. */
async function withFetch(route: (c: Call) => any, fn: (calls: Call[]) => Promise<void>) {
  const real = globalThis.fetch;
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string, init: any = {}) => {
    const raw = init.body;
    const c: Call = {
      method: init.method || 'GET',
      url: String(url),
      body: typeof raw === 'string' ? JSON.parse(raw) : null,
      headers: Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)])),
      size: raw instanceof Uint8Array ? raw.byteLength : 0,
    };
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

const MB = 1024 * 1024;
const video = (size: number) => ({ id: 'v', key: 'v', url: 'https://cdn.test/v.mp4', mime: 'video/mp4', size, filename: 'v.mp4', bytes: async () => Buffer.alloc(size, 1) });
const image = (id: string) => ({ id, key: id, url: `https://cdn.test/${id}.jpg`, mime: 'image/jpeg', size: 10, filename: `${id}.jpg`, bytes: async () => Buffer.from('x') });
const account = {
  id: 'acc', workspace_id: 'ws', platform: 'linkedin', external_id: 'abc123', username: 'Maya Chen', display_name: 'Maya Chen', avatar_url: null,
  access_token: 'tok', refresh_token: null, token_expires_at: null, meta: {}, status: 'active',
} as any;

const URN = 'urn:li:video:C5505AQH';
/** LinkedIn's answers: a 6 MB video comes back as two parts, then processes to `status`. */
function linkedinApi(status: () => string) {
  return (c: Call) => {
    if (c.url.endsWith('/videos?action=initializeUpload')) {
      return { value: { video: URN, uploadToken: '', uploadInstructions: [
        { uploadUrl: 'https://www.linkedin.com/dms-uploads/part0', firstByte: 0, lastByte: 4 * MB - 1 },
        { uploadUrl: 'https://www.linkedin.com/dms-uploads/part1', firstByte: 4 * MB, lastByte: 6 * MB - 1 },
      ] } };
    }
    if (c.url.includes('/dms-uploads/')) return new Response(null, { status: 200, headers: { etag: `"etag-${c.url.slice(-5)}"` } });
    if (c.url.endsWith('/videos?action=finalizeUpload')) return new Response('', { status: 200 });
    if (c.url.includes('/videos/')) return { id: URN, status: status() };
    if (c.url.endsWith('/rest/posts')) return new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:42' } });
  };
}

test('a LinkedIn video is uploaded in parts, finalized with the ETags in order, and posted once LinkedIn has processed it', async () => {
  const saved: any[] = [];
  await withFetch(linkedinApi(() => 'AVAILABLE'), async (calls) => {
    const res = await linkedin.publish({ account, caption: 'Launch day', media: [video(6 * MB)], options: {}, save: async (p) => { saved.push(p); } });
    assert.equal(res.externalId, 'urn:li:share:42');

    const init = calls.find((c) => c.url.endsWith('action=initializeUpload'))!;
    assert.deepEqual(init.body.initializeUploadRequest, { owner: 'urn:li:person:abc123', fileSizeBytes: 6 * MB, uploadCaptions: false, uploadThumbnail: false });

    const puts = calls.filter((c) => c.method === 'PUT');
    assert.deepEqual(puts.map((c) => c.size), [4 * MB, 2 * MB]);
    // Upload URLs are pre-signed: the access token is never sent to them.
    assert.ok(puts.every((c) => !c.headers.authorization && c.headers['content-type'] === 'application/octet-stream'));

    const fin = calls.find((c) => c.url.endsWith('action=finalizeUpload'))!;
    assert.deepEqual(fin.body.finalizeUploadRequest, { video: URN, uploadToken: '', uploadedPartIds: ['etag-part0', 'etag-part1'] });

    const post = calls.find((c) => c.url.endsWith('/rest/posts'))!;
    assert.deepEqual(post.body.content, { media: { id: URN } });
    assert.equal(post.body.commentary, 'Launch day');
    assert.deepEqual(saved, [{ li: { video: URN } }]);
  });
});

test('a LinkedIn video still processing hands over to a later attempt, which only waits and posts', async () => {
  let status = 'PROCESSING';
  const saved: Record<string, any> = {};
  await withFetch(linkedinApi(() => status), async (calls) => {
    const first = withDeadline(Date.now() + 20_000, () =>
      linkedin.publish({ account, caption: 'Launch day', media: [video(6 * MB)], options: {}, save: async (p) => { Object.assign(saved, p); } }));
    await assert.rejects(first, (e: any) => e instanceof PublishError && e.processing === true && e.retryable === true);
    assert.equal(calls.filter((c) => c.url.endsWith('/rest/posts')).length, 0);

    status = 'AVAILABLE';
    calls.length = 0;
    const res = await linkedin.publish({ account, caption: 'Launch day', media: [video(6 * MB)], options: {}, progress: saved, save: async () => {} });
    assert.equal(res.externalId, 'urn:li:share:42');
    assert.equal(calls.filter((c) => c.method === 'PUT' || c.url.includes('action=')).length, 0, 'nothing is uploaded again');
  });
});

test('a LinkedIn video that fails processing is a final error, and the saved upload is cleared', async () => {
  const saved: any[] = [];
  await withFetch(linkedinApi(() => 'PROCESSING_FAILED'), async (calls) => {
    await assert.rejects(
      linkedin.publish({ account, caption: 'x', media: [video(6 * MB)], options: {}, save: async (p) => { saved.push(p); } }),
      (e: any) => e instanceof PublishError && e.retryable === false && /MP4/.test(e.message),
    );
    assert.deepEqual(saved.at(-1), { li: null });
    assert.equal(calls.filter((c) => c.url.endsWith('/rest/posts')).length, 0);
  });
});

test('LinkedIn image posts are unchanged: several images become a multi-image post', async () => {
  let n = 0;
  await withFetch((c) => {
    if (c.url.includes('/images?action=initializeUpload')) { n++; return { value: { uploadUrl: `https://www.linkedin.com/up/${n}`, image: `urn:li:image:${n}` } }; }
    if (c.url.includes('/up/')) return new Response(null, { status: 201 });
    if (c.url.endsWith('/rest/posts')) return new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:7' } });
  }, async (calls) => {
    await linkedin.publish({ account, caption: 'Photos', media: [image('a'), image('b')], options: {} });
    const post = calls.find((c) => c.url.endsWith('/rest/posts'))!;
    assert.deepEqual(post.body.content, { multiImage: { images: [{ id: 'urn:li:image:1' }, { id: 'urn:li:image:2' }] } });
    assert.equal(calls.filter((c) => c.url.includes('/videos')).length, 0);
  });
});
