import { handler } from '@/lib/server/api';
import { exec } from '@/lib/server/db';

export const DELETE = handler(async ({ workspace, params }) => {
  await exec('DELETE FROM api_keys WHERE id=$1 AND workspace_id=$2', [params.id, workspace.id]);
  return { ok: true };
}, { sessionOnly: true });
