import { z } from 'zod';
import { body, handler } from '@/lib/server/api';
import { exec } from '@/lib/server/db';
import { requireEditor } from '@/lib/server/roles';

/** Sets the signature added to the end of every post when it publishes. Empty turns it off. */
export const PUT = handler(async ({ req, workspace }) => {
  requireEditor(workspace);
  const { signature } = z.object({ signature: z.string().max(500) }).parse(await body(req));
  await exec('UPDATE workspaces SET signature=$1 WHERE id=$2', [signature.trim(), workspace.id]);
  return { signature: signature.trim() };
});
