import { handler } from '@/lib/server/api';
import { workspacesForUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { listAccounts, listPosts } from '@/lib/server/posts';
import { PLATFORM_LIST, platformConfigured } from '@/lib/server/platforms';
import { storageConfigured } from '@/lib/server/storage';
import { publicMedia } from '@/lib/server/media';
import { billingSummary } from '@/lib/server/billing';
import { refreshStaleAvatars } from '@/lib/server/accounts';
import { freshMetaAvatar } from '@/lib/server/adapters/oauth';

export const dynamic = 'force-dynamic';

/** Everything the dashboard needs on first load, in one request. */
export const GET = handler(async ({ user, workspace }) => {
  // Meta picture URLs expire; refresh old ones before listing accounts (bounded wait).
  await refreshStaleAvatars(workspace.id, freshMetaAvatar).catch((e) => console.error('[avatars]', e));
  const [accounts, posts, mediaRows, keys, members, workspaces] = await Promise.all([
    listAccounts(workspace.id),
    listPosts(workspace.id, { limit: 2000 }),
    storageConfigured() ? query('SELECT * FROM media WHERE workspace_id=$1 AND uploaded ORDER BY created_at DESC LIMIT 500', [workspace.id]) : Promise.resolve([]),
    query('SELECT id,name,prefix,created_at,last_used_at FROM api_keys WHERE workspace_id=$1 ORDER BY created_at DESC', [workspace.id]),
    query('SELECT u.id,u.email,u.name,m.role FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=$1', [workspace.id]),
    workspacesForUser(user!.id),
  ]);
  const usage = await query(`SELECT jsonb_array_elements_text(media) AS id, COUNT(*)::int AS n FROM posts WHERE workspace_id=$1 GROUP BY 1`, [workspace.id]);
  return {
    user,
    workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, account_limit: workspace.account_limit, role: workspace.role, prefs: workspace.prefs || {} },
    workspaces: workspaces.map((w) => ({ id: w.id, name: w.name, plan: w.plan, role: w.role })),
    accounts, posts, keys, members,
    media: await Promise.all(mediaRows.map(publicMedia)),
    mediaUsage: Object.fromEntries(usage.map((u) => [u.id, u.n])),
    platforms: PLATFORM_LIST.map((p) => ({ id: p.id, authMode: p.authMode, configured: platformConfigured(p) })),
    storage: storageConfigured(),
    billing: billingSummary(workspace),
    now: Date.now(),
  };
}, { sessionOnly: true });
