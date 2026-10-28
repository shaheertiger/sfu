import { z } from 'zod';
import { body, handler } from '@/lib/server/api';
import { createApiKey } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { requirePaid } from '@/lib/server/billing';

export const GET = handler(async ({ workspace }) => ({
  keys: await query('SELECT id,name,prefix,created_at,last_used_at FROM api_keys WHERE workspace_id=$1 ORDER BY created_at DESC', [workspace.id]),
}));

export const POST = handler(async ({ req, workspace }) => {
  requirePaid(workspace, 'api');
  const { name } = z.object({ name: z.string().max(80).optional() }).parse(await body(req));
  return createApiKey(workspace.id, name || 'Default');
}, { sessionOnly: true });
