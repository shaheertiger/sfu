import { z } from 'zod';
import { body, handler, json } from '@/lib/server/api';
import { now, query, uid } from '@/lib/server/db';
import { randomToken } from '@/lib/server/crypto';
import { appUrl } from '@/lib/server/url';

export const GET = handler(async ({ workspace }) => ({
  members: await query('SELECT u.id,u.email,u.name,m.role FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=$1 ORDER BY m.role', [workspace.id]),
  invites: await query('SELECT id,email,role,created_at FROM invites WHERE workspace_id=$1 AND accepted_at IS NULL ORDER BY created_at DESC', [workspace.id]),
  plan: workspace.plan,
}));

export const POST = handler(async ({ req, workspace }) => {
  if (workspace.role !== 'owner') return json({ error: 'Only the workspace owner can invite people' }, 403);
  const { email, role } = z.object({ email: z.string().email(), role: z.enum(['member', 'editor']).optional() }).parse(await body(req));
  const token = randomToken(20);
  await query('INSERT INTO invites (id,workspace_id,email,token,role,created_at) VALUES ($1,$2,$3,$4,$5,$6)', [uid('inv'), workspace.id, email.toLowerCase(), token, role || 'member', now()]);
  return { invite_url: `${appUrl(req)}/invite/${token}` };
}, { sessionOnly: true });
