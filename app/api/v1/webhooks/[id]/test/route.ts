import { handler, json } from '@/lib/server/api';
import { one } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';
import { requirePaid } from '@/lib/server/billing';
import { sendTestEvent } from '@/lib/server/webhooks';

/** Sends a "ping" event so you can check the receiving end. */
export const POST = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  requirePaid(workspace, 'webhooks');
  const h = await one('SELECT * FROM webhooks WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  if (!h) return json({ error: 'Not found' }, 404);
  return sendTestEvent(h);
});
