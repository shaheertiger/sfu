#!/usr/bin/env node
/**
 * Schedule For You MCP server — lets Claude, Cursor, ChatGPT (via MCP) or any agent post through your Schedule For You workspace.
 *
 * Usage (stdio):
 *   SFY_URL=http://localhost:3000 SFY_API_KEY=sfy_... node mcp/server.mjs
 *
 * Claude Desktop / Claude Code config:
 *   { "mcpServers": { "scheduleforyou": { "command": "node", "args": ["/path/to/sfu/mcp/server.mjs"],
 *     "env": { "SFY_URL": "http://localhost:3000", "SFY_API_KEY": "sfy_..." } } } }
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE = (process.env.SFY_URL || 'http://localhost:3000').replace(/\/$/, '');
const KEY = process.env.SFY_API_KEY;
if (!KEY) { console.error('SFY_API_KEY is required'); process.exit(1); }

async function api(path, init = {}) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json', ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}
const text = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] });

const server = new McpServer({ name: 'scheduleforyou', version: '0.1.0' });

server.tool('list_accounts', 'List the connected social accounts you can post to. Returns ids to use in create_post.', {}, async () => {
  const { accounts } = await api('/accounts');
  return text(accounts.map((a) => ({ id: a.id, platform: a.platform, username: a.username })));
});

server.tool(
  'create_post',
  'Create a post for one or more connected accounts. Publishes immediately, schedules for later, or saves a draft.',
  {
    caption: z.string().describe('Post text. Keep under the shortest limit among chosen platforms (X 280, Bluesky 300, Threads 500).'),
    account_ids: z.array(z.string()).min(1).describe('Account ids from list_accounts'),
    scheduled_at: z.string().optional().describe('ISO 8601 datetime to publish at. Omit for draft, or set publish_now.'),
    publish_now: z.boolean().optional().describe('Publish right away'),
    media_urls: z.array(z.string().url()).optional().describe('Public image/video URLs to attach (downloaded into Schedule For You first)'),
    per_account: z.record(z.object({ caption: z.string().optional(), options: z.record(z.any()).optional() })).optional()
      .describe('Per-account overrides keyed by account id, e.g. a shorter caption for X or a YouTube title.'),
  },
  async ({ caption, account_ids, scheduled_at, publish_now, media_urls, per_account }) => {
    let media = [];
    if (media_urls?.length) {
      for (const u of media_urls) {
        const r = await fetch(u);
        if (!r.ok) throw new Error(`Could not download ${u}`);
        const blob = await r.blob();
        const filename = u.split('/').pop().split('?')[0] || 'media';
        // Upload straight to storage with a presigned URL, then confirm.
        const { id, upload_url } = await api('/media', { method: 'POST', body: JSON.stringify({ filename, mime: blob.type, size: blob.size }) });
        const put = await fetch(upload_url, { method: 'PUT', headers: { 'content-type': blob.type }, body: blob });
        if (!put.ok) throw new Error(`Upload of ${filename} failed (${put.status})`);
        await api(`/media/${id}`, { method: 'PATCH', body: JSON.stringify({ uploaded: true }) });
        media.push(id);
      }
    }
    const targets = account_ids.map((account_id) => ({ account_id, caption: per_account?.[account_id]?.caption, options: per_account?.[account_id]?.options }));
    const { post } = await api('/posts', { method: 'POST', body: JSON.stringify({ caption, targets, media, scheduled_at, publish_now }) });
    return text({ id: post.id, status: post.status, scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString() : null, targets: post.targets.map((t) => ({ account_id: t.account_id, status: t.status, url: t.external_url, error: t.error })) });
  }
);

server.tool('list_posts', 'List recent posts with their status (draft, scheduled, published, failed).', { status: z.enum(['draft', 'scheduled', 'published', 'failed', 'partial']).optional(), limit: z.number().int().max(100).optional() }, async ({ status, limit }) => {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  if (limit) qs.set('limit', String(limit));
  const { posts } = await api(`/posts?${qs}`);
  return text(posts.map((p) => ({ id: p.id, status: p.status, scheduled_at: p.scheduled_at ? new Date(p.scheduled_at).toISOString() : null, caption: p.caption.slice(0, 120), accounts: p.targets.map((t) => t.account_id) })));
});

server.tool('delete_post', 'Delete a draft or scheduled post.', { id: z.string() }, async ({ id }) => text(await api(`/posts/${id}`, { method: 'DELETE' })));

server.tool('publish_post', 'Publish a draft or retry a failed post now.', { id: z.string() }, async ({ id }) => text(await api(`/posts/${id}/publish`, { method: 'POST' })));

const transport = new StdioServerTransport();
await server.connect(transport);
