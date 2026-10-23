import { handler, json } from '@/lib/server/api';
import { disconnectAccount } from '@/lib/server/accounts';
import { requireEditor } from '@/lib/server/roles';

/**
 * Disconnects an account. Owners, editors and API keys only. Its targets on unpublished posts go
 * with it; posts left without any target become drafts.
 */
export const DELETE = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  return (await disconnectAccount(workspace.id, params.id)) ? { ok: true } : json({ error: 'Not found' }, 404);
});
