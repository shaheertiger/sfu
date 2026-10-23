import { handler, json } from '@/lib/server/api';
import { exec } from '@/lib/server/db';

/** Revokes an invitation that hasn't been accepted yet; its link stops working. Workspace owner only. */
export const DELETE = handler(async ({ workspace, params }) => {
  if (workspace.role !== 'owner') return json({ error: 'Only the workspace owner can revoke invitations' }, 403);
  const n = await exec('DELETE FROM invites WHERE id=$1 AND workspace_id=$2 AND accepted_at IS NULL', [params.id, workspace.id]);
  return n ? { ok: true } : json({ error: 'Not found' }, 404);
}, { sessionOnly: true });
