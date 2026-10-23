#!/usr/bin/env node
/**
 * Schedule For You MCP server over stdio, for clients that can't connect to a URL.
 * Most clients should use the hosted endpoint instead: https://scheduleforyou.com/api/mcp with the
 * header `Authorization: Bearer sfy_...` (see /docs#mcp-server).
 *
 * Usage:
 *   SFY_API_KEY=sfy_... node mcp/server.mjs            (SFY_URL defaults to https://scheduleforyou.com)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from '../lib/mcp/tools.mjs';

const BASE = (process.env.SFY_URL || 'https://scheduleforyou.com').replace(/\/$/, '');
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

async function download(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Could not download ${url}`);
  return r.blob();
}

const server = new McpServer({ name: 'scheduleforyou', version: '1.0.0' });
registerTools(server, { api, download });
await server.connect(new StdioServerTransport());
