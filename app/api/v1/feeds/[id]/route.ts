import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { exec, one, query } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';
import { requirePaid } from '@/lib/server/billing';
import { feedRow, getFeed } from '@/lib/server/rss';

export const PATCH = handler(async ({ req, workspace, params }) => {
  requireEditor(workspace);
  const f = await getFeed(workspace.id, params.id);
  if (!f) return json({ error: 'Not found' }, 404);
  const b = z.object({
    active: z.boolean().optional(),
    mode: z.enum(['draft', 'queue']).optional(),
    template: z.string().min(1).max(2000).optional(),
    account_ids: z.array(z.string()).max(100).optional(),
  }).parse(await body(req));
  // On Free a feed can still be switched off or removed, never on or changed.
  if (b.active !== false || b.mode || b.template || b.account_ids) requirePaid(workspace, 'rss');
  let accounts = b.account_ids;
  if (accounts) {
    const valid = new Set((await query('SELECT id FROM social_accounts WHERE workspace_id=$1', [workspace.id])).map((r) => r.id));
    accounts = accounts.filter((a) => valid.has(a));
  }
  await exec('UPDATE rss_feeds SET active=COALESCE($1,active), mode=COALESCE($2,mode), template=COALESCE($3,template), account_ids=COALESCE($4::jsonb,account_ids) WHERE id=$5', [
    b.active ?? null, b.mode ?? null, b.template ?? null, accounts ? JSON.stringify(accounts) : null, f.id,
  ]);
  return { feed: feedRow(await one('SELECT * FROM rss_feeds WHERE id=$1', [f.id])) };
});

export const DELETE = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  const n = await exec('DELETE FROM rss_feeds WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  return n ? { ok: true } : json({ error: 'Not found' }, 404);
});
