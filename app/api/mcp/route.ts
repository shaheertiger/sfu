import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { errorResponse, json } from '@/lib/server/api';
import { requireWorkspace } from '@/lib/server/auth';
import { safeFetchBlob } from '@/lib/server/safe-url';
import { appUrl } from '@/lib/server/url';
import { registerTools } from '@/lib/mcp/tools.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_MEDIA_BYTES = 100_000_000;

/**
 * Hosted MCP server (Streamable HTTP, stateless). Clients connect to https://scheduleforyou.com/api/mcp
 * with `Authorization: Bearer sfy_...`. Each tool calls the public REST API with the same key, so it
 * can do exactly what the key can.
 */
export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return json({ error: 'Send your API key as Authorization: Bearer sfy_… (Settings → API keys).' }, 401);
  }
  try {
    await requireWorkspace(req); // rejects bad keys before any tool runs
  } catch (e) {
    return errorResponse(e);
  }
  const base = appUrl(req);
  const api = async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`${base}/api/v1${path}`, {
      ...init,
      headers: { authorization: auth, 'content-type': 'application/json', ...((init.headers as Record<string, string>) || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
    return data;
  };
  // Files are fetched by our server, so only public internet addresses are allowed.
  const download = (url: string) => safeFetchBlob(url, { timeoutMs: 60_000, maxBytes: MAX_MEDIA_BYTES });
  const server = new McpServer({ name: 'scheduleforyou', version: '1.0.0' });
  registerTools(server, { api, download });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(req);
}

/** Stateless server: no server-sent event stream and no sessions to close. */
const notAllowed = () => new Response(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }), { status: 405, headers: { allow: 'POST', 'content-type': 'application/json' } });
export const GET = notAllowed;
export const DELETE = notAllowed;
