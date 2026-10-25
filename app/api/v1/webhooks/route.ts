import crypto from 'node:crypto';
import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { now, one, query, uid } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';
import { assertPublicUrl } from '@/lib/server/safe-url';
import { webhookRow } from '@/lib/server/webhook-row';
import { WEBHOOK_EVENTS, WEBHOOK_FORMATS } from '@/lib/server/webhooks';

export const GET = handler(async ({ workspace }) => ({
  webhooks: (await query('SELECT * FROM webhooks WHERE workspace_id=$1 ORDER BY created_at', [workspace.id])).map((h) => webhookRow(h)),
}));

/** Adds a webhook. The response includes the signing secret once. */
export const POST = handler(async ({ req, workspace }) => {
  requireEditor(workspace);
  const b = z.object({ url: z.string().max(2000), events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(), format: z.enum(WEBHOOK_FORMATS).optional() }).parse(await body(req));
  const url = (await assertPublicUrl(b.url.trim())).toString();
  const count = (await one('SELECT count(*)::int AS n FROM webhooks WHERE workspace_id=$1', [workspace.id])).n;
  if (count >= 10) return json({ error: 'A workspace can have up to 10 webhooks' }, 400);
  const id = uid('whk');
  const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
  await query('INSERT INTO webhooks (id, workspace_id, url, secret, events, format, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [
    id, workspace.id, url, secret, JSON.stringify(b.events ?? WEBHOOK_EVENTS), b.format ?? 'json', now(),
  ]);
  return json({ webhook: webhookRow(await one('SELECT * FROM webhooks WHERE id=$1', [id]), true) }, 201);
});
