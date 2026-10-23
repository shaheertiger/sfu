import { body, handler } from '@/lib/server/api';
import { adapterFor } from '@/lib/server/adapters';
import { upsertAccount } from '@/lib/server/accounts';
import { publicAccount } from '@/lib/server/posts';
import { HttpError } from '@/lib/server/auth';
import { PublishError } from '@/lib/server/adapters/types';
import { requireEditor } from '@/lib/server/roles';

/** Bluesky connects with a handle + app password (no OAuth app needed). */
export const POST = handler(async ({ req, workspace }) => {
  requireEditor(workspace);
  const creds = await body<Record<string, string>>(req);
  try {
    const fields = await adapterFor('bluesky').connectWithCredentials!(creds);
    return { account: publicAccount(await upsertAccount(workspace.id, 'bluesky', fields)) };
  } catch (e: any) {
    if (e instanceof PublishError) throw new HttpError(400, e.message);
    throw e;
  }
}, { sessionOnly: true });
