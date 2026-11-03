import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverMs, instagram, tiktok, tiktokChunks, tiktokPhotoText, TIKTOK_SINGLE_MAX } from '../lib/server/adapters/oauth.ts';
import { withDeadline } from '../lib/server/adapters/types.ts';

type Call = { method: string; url: string; body: string; headers: Record<string, string>; len: number };

async function withFetch(route: (c: Call) => any, fn: (calls: Call[]) => Promise<void>) {
  const real = globalThis.fetch;
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string, init: any = {}) => {
    const c = { method: init.method || 'GET', url: String(url), body: typeof init.body === 'string' ? init.body : '', headers: init.headers || {}, len: init.body?.byteLength ?? 0 };
    calls.push(c);
    const out = await route(c);
    if (out instanceof Response) return out;
    return new Response(JSON.stringify(out ?? {}), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as any;
  try { await fn(calls); } finally { globalThis.fetch = real; }
}

const account = (platform: string) => ({
  id: 'acc', workspace_id: 'ws', platform, external_id: '1789', username: 'harbor', display_name: 'Harbor', avatar_url: null,
  access_token: 'tok', refresh_token: null, token_expires_at: null, meta: {}, status: 'active',
}) as any;
const video = (size: number) => ({ id: 'v', key: 'v', url: 'https://cdn.test/v.mp4', mime: 'video/mp4', size, filename: 'v.mp4', bytes: async () => Buffer.alloc(size) });

test('TikTok: videos up to 64 MB go up in one piece', () => {
  assert.deepEqual(tiktokChunks(1000), { chunkSize: 1000, count: 1, ranges: [[0, 999]] });
  assert.equal(tiktokChunks(TIKTOK_SINGLE_MAX).count, 1);
});

test('TikTok: bigger videos are chunked by its rules (5–64 MB chunks, last one takes the rest, up to 128 MB)', () => {
  const MB = 1024 * 1024;
  for (const size of [64 * MB + 1, 95 * MB + 123, 500 * MB, 2048 * MB - 7]) {
    const { chunkSize, count, ranges } = tiktokChunks(size);
    assert.equal(count, Math.floor(size / chunkSize));
    assert.equal(ranges.length, count);
    assert.equal(ranges[0][0], 0);
    assert.equal(ranges.at(-1)![1], size - 1);
    for (let i = 1; i < ranges.length; i++) assert.equal(ranges[i][0], ranges[i - 1][1] + 1);
    for (const [a, b] of ranges.slice(0, -1)) { assert.ok(b - a + 1 >= 5 * MB && b - a + 1 <= 64 * MB); }
    const [la, lb] = ranges.at(-1)!;
    assert.ok(lb - la + 1 >= 5 * MB && lb - la + 1 <= 128 * MB);
  }
});

test('TikTok video publish uploads every chunk with matching ranges and passes the cover frame', async () => {
  const size = 70 * 1024 * 1024;
  await withFetch((c) => (c.url.includes('/init/') ? { data: { publish_id: 'pub1', upload_url: 'https://upload.test/u' } } : new Response('', { status: 201 })), async (calls) => {
    const out = await tiktok.publish({ account: account('tiktok'), caption: 'hello', media: [video(size)] as any, options: { privacy: 'PUBLIC_TO_EVERYONE', cover_ms: 2500 } } as any);
    assert.equal(out.externalId, 'pub1');
    const init = JSON.parse(calls[0].body);
    assert.equal(init.post_info.video_cover_timestamp_ms, 2500);
    const { count, chunkSize } = tiktokChunks(size);
    assert.equal(init.source_info.total_chunk_count, count);
    assert.equal(init.source_info.chunk_size, chunkSize);
    const puts = calls.filter((c) => c.method === 'PUT');
    assert.equal(puts.length, count);
    assert.equal(puts.reduce((n, c) => n + c.len, 0), size);
    assert.equal(puts.at(-1)!.headers['content-range'], `bytes ${tiktokChunks(size).ranges.at(-1)![0]}-${size - 1}/${size}`);
  });
});

test('TikTok video without a cover leaves the choice to TikTok', async () => {
  await withFetch((c) => (c.url.includes('/init/') ? { data: { publish_id: 'p', upload_url: 'https://upload.test/u' } } : new Response('', { status: 201 })), async (calls) => {
    await tiktok.publish({ account: account('tiktok'), caption: 'x', media: [video(10)] as any, options: {} } as any);
    assert.equal('video_cover_timestamp_ms' in JSON.parse(calls[0].body).post_info, false);
  });
});

test('TikTok photo posts never repeat the caption as title and description', () => {
  assert.deepEqual(tiktokPhotoText('Short title\nThe rest of it\n#tags'), { title: 'Short title', description: 'The rest of it\n#tags' });
  assert.deepEqual(tiktokPhotoText('Just one line'), { title: '', description: 'Just one line' });
  const long = 'x'.repeat(120) + '\nmore';
  assert.deepEqual(tiktokPhotoText(long), { title: '', description: long });
});

test('cover_ms accepts a non-negative number only', () => {
  assert.equal(coverMs({ cover_ms: 1500 }), 1500);
  assert.equal(coverMs({ cover_ms: '0' }), 0);
  assert.equal(coverMs({ cover_ms: -1 }), undefined);
  assert.equal(coverMs({ cover_ms: 'abc' }), undefined);
  assert.equal(coverMs({}), undefined);
});

test('Instagram Reels get thumb_offset from cover_ms', async () => {
  await withFetch((c) => {
    if (c.method === 'POST' && /\/media$/.test(c.url)) return { id: 'cont1' };
    if (c.url.includes('status_code')) return { status_code: 'FINISHED' };
    if (c.url.includes('media_publish')) return { id: 'm1' };
    return { status_code: 'FINISHED', id: 'x' };
  }, async (calls) => {
    await withDeadline(Date.now() + 20_000, () => instagram.publish({ account: account('instagram'), caption: 'reel', media: [video(10)] as any, options: { format: 'reel', cover_ms: 3000 } } as any)).catch(() => {});
    const made = calls.find((c) => c.method === 'POST' && /\/media$/.test(c.url))!;
    assert.match(made.body, /thumb_offset=3000/);
  });
});
