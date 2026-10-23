import { test } from 'node:test';
import assert from 'node:assert/strict';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { registerTools } from '../lib/mcp/tools.mjs';

// Runs one JSON-RPC request through a fresh stateless server, the way app/api/mcp does.
async function call(method: string, params: any, api: any) {
  const server = new McpServer({ name: 'scheduleforyou', version: '1.0.0' });
  registerTools(server, { api, download: async () => new Blob(['x'], { type: 'image/png' }) });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  const res = await transport.handleRequest(new Request('https://x.test/api/mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  }));
  return res.json();
}

const init = { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } };

test('the hosted MCP server lists the posting tools', async () => {
  const r: any = await call('initialize', init, async () => ({}));
  assert.equal(r.result.serverInfo.name, 'scheduleforyou');
  const list: any = await call('tools/list', {}, async () => ({}));
  assert.deepEqual(list.result.tools.map((t: any) => t.name).sort(), ['create_post', 'delete_post', 'list_accounts', 'list_posts', 'publish_post']);
});

test('create_post sends a scheduled post to the REST API and reports each target', async () => {
  const calls: any[] = [];
  const api = async (path: string, init: any = {}) => {
    calls.push([path, init.method || 'GET', init.body ? JSON.parse(init.body) : null]);
    return { post: { id: 'post_1', status: 'scheduled', scheduled_at: Date.parse('2026-11-01T14:00:00Z'), targets: [{ account_id: 'acc_1', status: 'pending' }] } };
  };
  const r: any = await call('tools/call', { name: 'create_post', arguments: { caption: 'Hi', account_ids: ['acc_1'], scheduled_at: '2026-11-01T14:00:00Z', per_account: { acc_1: { options: { format: 'reel' } } } } }, api);
  assert.equal(r.result.isError, undefined);
  const out = JSON.parse(r.result.content[0].text);
  assert.equal(out.id, 'post_1');
  assert.equal(out.scheduled_at, '2026-11-01T14:00:00.000Z');
  const [path, method, body] = calls[0];
  assert.equal(path, '/posts');
  assert.equal(method, 'POST');
  assert.equal(body.status, 'scheduled');
  assert.deepEqual(body.targets[0].options, { format: 'reel' });
});

test('API errors come back to the agent as tool errors, not crashes', async () => {
  const r: any = await call('tools/call', { name: 'publish_post', arguments: { id: 'post_x' } }, async () => { throw new Error('Not found'); });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /Not found/);
});
