import { z } from 'zod';

/**
 * The Schedule For You MCP tools, shared by the hosted endpoint (app/api/mcp) and the local stdio
 * server (mcp/server.mjs). Every tool goes through the public REST API with the caller's key.
 *
 * @param server  an McpServer
 * @param deps.api       (path, init?) => JSON from /api/v1, throws Error with the API's message
 * @param deps.download  (url) => Blob of a public file to attach
 */
export function registerTools(server, { api, download }) {
  const text = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] });
  const iso = (ms) => (ms ? new Date(ms).toISOString() : null);

  server.tool('list_accounts', 'List the connected social accounts you can post to. Returns ids to use in create_post.', {}, async () => {
    const { accounts } = await api('/accounts');
    return text(accounts.map((a) => ({ id: a.id, platform: a.platform, username: a.username, over_limit: !!a.over_limit })));
  });

  server.tool(
    'create_post',
    'Create a post for one or more connected accounts. Publishes immediately, schedules for later, or saves a draft.',
    {
      caption: z.string().describe('Post text. Keep under the shortest limit among chosen platforms (X 280, Bluesky 300, Threads 500).'),
      account_ids: z.array(z.string()).min(1).describe('Account ids from list_accounts'),
      scheduled_at: z.string().optional().describe('ISO 8601 date and time to publish at. Omit for a draft, or set publish_now.'),
      publish_now: z.boolean().optional().describe('Publish right away'),
      media_urls: z.array(z.string().url()).max(10).optional().describe('Public image or video URLs to attach (copied into Schedule For You first)'),
      per_account: z
        .record(z.string(), z.object({ caption: z.string().optional(), options: z.record(z.string(), z.any()).optional() }))
        .optional()
        .describe('Per-account overrides keyed by account id: a shorter caption for X, a YouTube title, or { "format": "reel" } for Instagram or Facebook.'),
    },
    async ({ caption, account_ids, scheduled_at, publish_now, media_urls, per_account }) => {
      const media = [];
      for (const u of media_urls || []) {
        const blob = await download(u);
        const filename = decodeURIComponent(new URL(u).pathname.split('/').pop() || 'media') || 'media';
        // Upload straight to storage with a presigned URL, then confirm.
        const { id, upload_url } = await api('/media', { method: 'POST', body: JSON.stringify({ filename, mime: blob.type, size: blob.size }) });
        const put = await fetch(upload_url, { method: 'PUT', headers: { 'content-type': blob.type }, body: blob });
        if (!put.ok) throw new Error(`Upload of ${filename} failed (${put.status})`);
        await api(`/media/${id}`, { method: 'PATCH', body: JSON.stringify({ uploaded: true }) });
        media.push(id);
      }
      const targets = account_ids.map((account_id) => ({ account_id, caption: per_account?.[account_id]?.caption, options: per_account?.[account_id]?.options }));
      const { post } = await api('/posts', {
        method: 'POST',
        body: JSON.stringify({ caption, targets, media, ...(scheduled_at ? { scheduled_at, status: 'scheduled' } : {}), publish_now }),
      });
      return text({ id: post.id, status: post.status, scheduled_at: iso(post.scheduled_at), targets: post.targets.map((t) => ({ account_id: t.account_id, status: t.status, url: t.external_url, error: t.error })) });
    },
  );

  server.tool(
    'list_posts',
    'List recent posts with their status (draft, scheduled, published, failed).',
    { status: z.enum(['draft', 'scheduled', 'published', 'failed', 'partial']).optional(), limit: z.number().int().min(1).max(100).optional() },
    async ({ status, limit }) => {
      const qs = new URLSearchParams();
      if (status) qs.set('status', status);
      qs.set('limit', String(limit || 25));
      const { posts } = await api(`/posts?${qs}`);
      return text(posts.map((p) => ({ id: p.id, status: p.status, scheduled_at: iso(p.scheduled_at), caption: (p.caption || '').slice(0, 120), accounts: p.targets.map((t) => t.account_id) })));
    },
  );

  server.tool('delete_post', 'Delete a draft or scheduled post.', { id: z.string() }, async ({ id }) => text(await api(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' })));

  server.tool('publish_post', 'Publish a draft or retry a failed post now.', { id: z.string() }, async ({ id }) => text(await api(`/posts/${encodeURIComponent(id)}/publish`, { method: 'POST' })));
}
