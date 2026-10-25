import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { disconnectAccount, setDefaultFirstComment } from '@/lib/server/accounts';
import { publicAccount } from '@/lib/server/posts';
import { requireEditor } from '@/lib/server/roles';

/**
 * Account settings. `default_first_comment` is posted under every post to this account that has no
 * first comment of its own; `null` or an empty string removes it. Owners, editors and API keys only.
 */
export const PATCH = handler(async ({ req, workspace, params }) => {
  requireEditor(workspace);
  const b = z.object({ default_first_comment: z.string().max(8000).nullable() }).parse(await body(req));
  const row = await setDefaultFirstComment(workspace.id, params.id, b.default_first_comment);
  return row ? { account: publicAccount(row) } : json({ error: 'Not found' }, 404);
});

/**
 * Disconnects an account. Owners, editors and API keys only. Its targets on unpublished posts go
 * with it; posts left without any target become drafts.
 */
export const DELETE = handler(async ({ workspace, params }) => {
  requireEditor(workspace);
  return (await disconnectAccount(workspace.id, params.id)) ? { ok: true } : json({ error: 'Not found' }, 404);
});
