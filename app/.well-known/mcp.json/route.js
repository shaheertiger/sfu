import { abs } from '@/lib/md/format';
import { DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-static';

/** MCP discovery for the server at /api/mcp (documented under /docs#mcp-server). */
export const GET = () =>
  new Response(
    JSON.stringify({
      name: SITE_NAME,
      description: DESCRIPTION,
      endpoint: abs('/api/mcp'),
      transport: 'streamable-http',
      authentication: { type: 'bearer', description: 'An API key from the dashboard (Settings → API keys), sent as Authorization: Bearer <key>.' },
      documentation: abs('/docs#mcp-server'),
      llms: abs('/llms.txt'),
    }, null, 2),
    { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', 'Access-Control-Allow-Origin': '*' } },
  );
