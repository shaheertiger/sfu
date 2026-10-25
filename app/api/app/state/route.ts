import { handler } from '@/lib/server/api';
import { workspacesForUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { listAccounts, listPosts } from '@/lib/server/posts';
import { PLATFORM_LIST, platformConfigured } from '@/lib/server/platforms';
import { storageConfigured } from '@/lib/server/storage';
import { publicMedia } from '@/lib/server/media';
import { billingSummary } from '@/lib/server/billing';
import { refreshStaleAvatars } from '@/lib/server/accounts';
import { setSignedInHint } from '@/lib/server/signed-in-hint';
import { freshMetaAvatar } from '@/lib/server/adapters/oauth';
import { mediaUsage } from '@/lib/server/media-usage';

export const dynamic = 'force-dynamic';

/** Everything the dashboard needs on first load, in one request. */
export const GET = handler(async ({ user, workspace }) => {
  // Meta picture URLs expire; refresh old ones before listing accounts (bounded wait).
  await refreshStaleAvatars(workspace.id, freshMetaAvatar).catch((e) => console.error('[avatars]', e));
  await setSignedInHint(true); // keeps "Open dashboard" on the marketing pages for people already signed in
  const [accounts, posts, mediaRows, keys, members, workspaces, invites] = await Promise.all([
    listAccounts(workspace.id),
    listPosts(workspace.id, { limit: 2000 }),
    storageConfigured() ? query('SELECT * FROM media WHERE workspace_id=$1 AND uploaded ORDER BY created_at DESC LIMIT 500', [workspace.id]) : Promise.resolve([]),
    query('SELECT id,name,prefix,created_at,last_used_at FROM api_keys WHERE workspace_id=$1 ORDER BY created_at DESC', [workspace.id]),
    query('SELECT u.id,u.email,u.name,m.role FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=$1', [workspace.id]),
    workspacesForUser(user!.id),
    // Invitations not accepted yet (revoke with DELETE /api/v1/team/invites/{id}).
    query('SELECT id,email,role,created_at FROM invites WHERE workspace_id=$1 AND accepted_at IS NULL ORDER BY created_at DESC', [workspace.id]),
  ]);
  // Per file: how many posts use it, where it has been published and when it last went out.
  const usage = await mediaUsage(workspace.id);
  return {
    user,
    workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, account_limit: workspace.account_limit, role: workspace.role, prefs: workspace.prefs || {} },
    workspaces: workspaces.map((w) => ({ id: w.id, name: w.name, plan: w.plan, role: w.role })),
    accounts, posts, keys, members, invites,
    media: await Promise.all(mediaRows.map(publicMedia)),
    mediaUsage: usage,
    platforms: PLATFORM_LIST.map((p) => ({ id: p.id, authMode: p.authMode, configured: platformConfigured(p) })),
    storage: storageConfigured(),
    billing: billingSummary(workspace),
    now: Date.now(),
  };
}, { sessionOnly: true });
