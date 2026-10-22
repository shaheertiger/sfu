import { z } from 'zod';
import { body, handler } from '@/lib/server/api';
import { DEFAULT_PREFS, HttpError, switchWorkspace } from '@/lib/server/auth';
import { now, tx, uid } from '@/lib/server/db';

/** Switch the active workspace. */
export const PUT = handler(async ({ req, user }) => {
  const { id } = z.object({ id: z.string() }).parse(await body(req));
  await switchWorkspace(user!.id, id);
  return { ok: true };
}, { sessionOnly: true });

/** Create another workspace (e.g. for a client) and switch to it. */
export const POST = handler(async ({ req, user }) => {
  const { name } = z.object({ name: z.string().min(1).max(80) }).parse(await body(req));
  if (!user) throw new HttpError(403, 'Sign in first');
  const id = uid('ws');
  await tx(async (q) => {
    await q('INSERT INTO workspaces (id,name,plan,account_limit,owner_id,prefs,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, name, 'trial', 15, user.id, JSON.stringify(DEFAULT_PREFS), now()]);
    await q('INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3)', [id, user.id, 'owner']);
  });
  await switchWorkspace(user.id, id);
  return { id };
}, { sessionOnly: true });
