import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { one } from '@/lib/server/db';
import { connectAccounts } from '@/lib/server/accounts';
import { requireEditor } from '@/lib/server/roles';
import { dropPending, loadPending, pickerView } from '@/lib/server/pending-connections';

const gone = () => json({ error: 'That list has expired. Connect again to choose your accounts.' }, 404);

/** The accounts a login returned, for the person to choose from. */
export const GET = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  const p = await loadPending(workspace.id, params.id);
  if (!p) return gone();
  const { c } = (await one('SELECT COUNT(*)::int AS c FROM social_accounts WHERE workspace_id=$1', [workspace.id]))!;
  return { platform: p.platform, accounts: p.accounts.map(pickerView), used: Number(c), limit: workspace.account_limit };
}, { sessionOnly: true });

/** Connects the chosen accounts (within the plan's limit) and forgets the rest. */
export const POST = handler(async ({ req, workspace, params }) => {
  requireEditor(workspace);
  const { external_ids } = z.object({ external_ids: z.array(z.string().max(100)).max(500) }).parse(await body(req));
  const p = await loadPending(workspace.id, params.id);
  if (!p) return gone();
  const chosen = new Set(external_ids);
  const r = await connectAccounts(workspace.id, p.platform, p.accounts.filter((a) => chosen.has(a.external_id)));
  await dropPending(params.id);
  return { platform: p.platform, added: r.added, updated: r.updated, skipped: r.skipped, limit: r.limit };
}, { sessionOnly: true });
