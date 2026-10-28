import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTERS } from '../lib/server/adapters/index.ts';
import { x, facebook, instagram, linkedin } from '../lib/server/adapters/oauth.ts';

process.env.TOKEN_ENCRYPTION_KEY ||= 'a'.repeat(64);

type Call = { method: string; url: string; body: string; headers: Record<string, string> };
async function withFetch(route: (c: Call) => any, fn: (calls: Call[]) => Promise<void>) {
  const real = globalThis.fetch;
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string, init: any = {}) => {
    const c = { method: init.method || 'GET', url: String(url), body: typeof init.body === 'string' ? init.body : init.body ? '[binary]' : '', headers: init.headers || {} };
    calls.push(c);
    const out = await route(c);
    if (out instanceof Response) return out;
    return new Response(JSON.stringify(out ?? {}), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as any;
  try { await fn(calls); } finally { globalThis.fetch = real; }
}
const account = (platform: string) => ({ id: 'acc', workspace_id: 'ws', platform, external_id: '1789', username: 'harbor', display_name: 'Harbor', avatar_url: null, access_token: 'tok', refresh_token: null, token_expires_at: null, meta: {}, status: 'active' }) as any;

test('X posts a thread as replies, keeps media on the first post, and resumes a cut-off thread', async () => {
  let n = 0;
  const saved: any[] = [];
  await withFetch((c) => ({ data: { id: `t${++n}` } }), async (calls) => {
    const r = await x.publish({ account: account('x'), caption: 'One\n---\nTwo\n---\nThree', media: [], options: {}, save: async (p) => { saved.push(p); } });
    assert.equal(r.externalId, 't1');
    const bodies = calls.map((c) => JSON.parse(c.body));
    assert.equal(bodies.length, 3);
    assert.equal(bodies[0].reply, undefined);
    assert.deepEqual(bodies[1].reply, { in_reply_to_tweet_id: 't1' });
    assert.deepEqual(bodies[2].reply, { in_reply_to_tweet_id: 't2' });
    assert.deepEqual(saved.at(-1), { thread: { ids: ['t1', 't2', 't3'] }, sending: null });
  });
  // Resume: the first two parts were posted by an earlier attempt.
  n = 10;
  await withFetch((c) => ({ data: { id: `t${++n}` } }), async (calls) => {
    const r = await x.publish({ account: account('x'), caption: 'One\n---\nTwo\n---\nThree', media: [], options: {}, progress: { thread: { ids: ['a', 'b'] } } });
    assert.equal(calls.length, 1);
    assert.deepEqual(JSON.parse(calls[0].body), { text: 'Three', reply: { in_reply_to_tweet_id: 'b' } });
    assert.equal(r.externalId, 'a');
  });
});

test('first comments use each platform’s comment endpoint', async () => {
  await withFetch(() => ({ data: { id: 'c1' } }), async (calls) => {
    await x.comment!({ account: account('x'), externalId: '555', text: '#hashtags' });
    assert.deepEqual(JSON.parse(calls[0].body), { text: '#hashtags', reply: { in_reply_to_tweet_id: '555' } });
  });
  await withFetch(() => ({ id: 'c2' }), async (calls) => {
    await instagram.comment!({ account: account('instagram'), externalId: '1790', text: '#bread' });
    assert.match(calls[0].url, /\/1790\/comments$/);
    assert.equal(calls[0].body, 'message=%23bread&access_token=tok');
    await facebook.comment!({ account: account('facebook'), externalId: '1_2', text: 'Link in comments' });
    assert.match(calls[1].url, /\/1_2\/comments$/);
  });
  await withFetch(() => ({ id: 'urn:li:comment:1' }), async (calls) => {
    await linkedin.comment!({ account: account('linkedin'), externalId: 'urn:li:share:9', text: 'More here' });
    assert.equal(calls[0].url, 'https://api.linkedin.com/rest/socialActions/urn%3Ali%3Ashare%3A9/comments');
    assert.deepEqual(JSON.parse(calls[0].body), { actor: 'urn:li:person:1789', message: { text: 'More here' } });
  });
});

/* ---------- publisher: the comment never fails the post ---------- */
type Target = Record<string, any>;
function fakeDb(targets: Partial<Target>[], prefs: Record<string, any> = {}) {
  const db = {
    post: { id: 'post1', workspace_id: 'ws', caption: 'Hello https://example.com/our-autumn-menu-is-here', media: [], status: 'publishing', scheduled_at: Date.now() - 1000, repeat: 'none', evergreen: false, signature: false } as Record<string, any>,
    targets: targets.map((t, i) => ({ id: `t${i + 1}`, post_id: 'post1', account_id: 'acc1', status: 'pending', attempts: 0, error: null, progress: {}, options: {}, caption_override: null, ...t })) as Target[],
    links: [] as any[],
    sql: [] as string[],
  };
  const account = { id: 'acc1', workspace_id: 'ws', platform: 'x', username: 'harbor', access_token: null, refresh_token: null, token_expires_at: null, meta: {}, status: 'active', last_error: null };
  const tgt = (id: string) => db.targets.find((t) => t.id === id)!;
  const rows = (r: any[]) => ({ rows: r, rowCount: r.length });
  const run = async (text: string, p: any[] = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    db.sql.push(sql);
    if (sql.startsWith('SELECT * FROM posts WHERE id=$1')) return rows([{ ...db.post }]);
    if (sql.startsWith('SELECT * FROM post_targets WHERE post_id=$1')) return rows(db.targets.map((t) => ({ ...t })));
    if (sql.startsWith('SELECT status FROM post_targets')) return rows(db.targets.map((t) => ({ status: t.status })));
    if (sql.startsWith('SELECT a.id FROM') || sql.startsWith('SELECT id FROM ( SELECT id, ROW_NUMBER()')) return rows([]);
    if (sql.startsWith('SELECT * FROM workspaces WHERE id=$1')) return rows([{ id: 'ws', name: 'WS', signature: '', prefs: { alerts: { fail: false }, ...prefs } }]);
    if (sql.startsWith('SELECT * FROM social_accounts WHERE id=$1')) return rows([account]);
    if (sql.startsWith('SELECT name, prefs FROM workspaces')) return rows([{ name: 'WS', prefs: { alerts: { fail: false }, ...prefs } }]);
    if (sql.startsWith('SELECT') && sql.includes('FROM webhooks')) return rows([]);
    if (sql.startsWith('SELECT code FROM links')) return rows(db.links.filter((l) => l.target_id === p[0] && l.url === p[1]));
    if (sql.startsWith('INSERT INTO links')) { db.links.push({ code: p[0], target_id: p[3], url: p[4] }); return rows([{ code: p[0] }]); }
    if (sql.startsWith("UPDATE post_targets SET status='publishing', attempts=attempts+1")) { const t = tgt(p[0]); t.status = 'publishing'; t.attempts++; return rows([]); }
    if (sql.startsWith('UPDATE post_targets SET progress =')) { Object.assign(tgt(p[1]).progress, JSON.parse(p[0])); return rows([]); }
    if (sql.startsWith("UPDATE post_targets SET status='published'")) { Object.assign(tgt(p[3]), { status: 'published', external_id: p[0], error: null, progress: {} }); return rows([]); }
    if (sql.startsWith('UPDATE post_targets SET error=$1 WHERE id=$2')) { tgt(p[1]).error = p[0]; return rows([]); }
    if (sql.startsWith('UPDATE posts SET status=$1, scheduled_at=CASE')) { db.post.status = p[0]; return rows([]); }
    throw new Error('unexpected query: ' + sql.slice(0, 120));
  };
  (globalThis as any).__sfyPool = { query: run, connect: async () => ({ query: run, release() {} }) };
  return db;
}
const realX = ADAPTERS.x;
afterEach(() => { ADAPTERS.x = realX; });
const quietly = async <T>(fn: () => Promise<T>) => { const err = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = err; } };

test('the first comment is posted after the post is recorded as published; a failing comment is noted, not a failure', async () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  const { publishPost } = await import('../lib/server/publisher.ts');
  const db = fakeDb([{ options: { first_comment: 'Read more: https://example.com/our-autumn-menu-is-here' } }], { trackLinks: true });
  const comments: any[] = [];
  const captions: string[] = [];
  ADAPTERS.x = { platform: 'x', publish: async (i: any) => { captions.push(i.caption); return { externalId: '77' }; }, comment: async (c: any) => { comments.push(c); return {}; } } as any;
  assert.equal(await publishPost('post1'), 'published');
  assert.equal(comments.length, 1);
  assert.equal(comments[0].externalId, '77');
  // Link tracking swapped the link in both the caption and the comment for the same short link.
  assert.match(captions[0], /^Hello https:\/\/scheduleforyou\.com\/l\/[A-Za-z0-9]{7}$/);
  const code = captions[0].split('/l/')[1];
  assert.equal(comments[0].text, `Read more: https://scheduleforyou.com/l/${code}`);
  assert.equal(db.links.length, 1);
  assert.equal(db.targets[0].status, 'published');
  assert.equal(db.targets[0].error, null);

  const db2 = fakeDb([{ options: { first_comment: '#tags' } }]);
  ADAPTERS.x = { platform: 'x', publish: async () => ({ externalId: '78' }), comment: async () => { throw new Error('Comments are disabled on this post'); } } as any;
  assert.equal(await quietly(() => publishPost('post1')), 'published');
  assert.equal(db2.targets[0].status, 'published');
  assert.match(db2.targets[0].error, /^Published, but the first comment was not added: Comments are disabled/);
  delete process.env.APP_URL;
});
