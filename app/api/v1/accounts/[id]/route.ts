import { handler, json } from '@/lib/server/api';
import { exec } from '@/lib/server/db';

export const DELETE = handler(async ({ workspace, params }) => {
  const n = await exec('DELETE FROM social_accounts WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  return n ? { ok: true } : json({ error: 'Not found' }, 404);
});
