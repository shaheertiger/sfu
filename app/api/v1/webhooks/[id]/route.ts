import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { exec, one } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';
import { webhookRow } from '@/lib/server/webhook-row';
import { WEBHOOK_EVENTS } from '@/lib/server/webhooks';

export const PATCH = handler(async ({ req, workspace, params }) => {
  requireEditor(workspace);
  const h = await one('SELECT * FROM webhooks WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  if (!h) return json({ error: 'Not found' }, 404);
  const b = z.object({ active: z.boolean().optional(), events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional() }).parse(await body(req));
  await exec('UPDATE webhooks SET active=COALESCE($1, active), events=COALESCE($2::jsonb, events) WHERE id=$3', [
    b.active ?? null, b.events ? JSON.stringify(b.events) : null, h.id,
  ]);
  return { webhook: webhookRow(await one('SELECT * FROM webhooks WHERE id=$1', [h.id])) };
});

export const DELETE = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  const n = await exec('DELETE FROM webhooks WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  return n ? { ok: true } : json({ error: 'Not found' }, 404);
});
