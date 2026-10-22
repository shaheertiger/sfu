import { handler } from '@/lib/server/api';
import { workspacesForUser } from '@/lib/server/auth';

export const GET = handler(async ({ user, workspace }) => ({
  user,
  workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, role: workspace.role },
  workspaces: user ? (await workspacesForUser(user.id)).map((w) => ({ id: w.id, name: w.name, plan: w.plan, role: w.role })) : [],
}), { sessionOnly: true });
