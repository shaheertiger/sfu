import 'server-only';
import { exec, now, query, tx, uid } from './db';
import { decrypt, encrypt } from './crypto';
import { HttpError } from './http-error';
import type { ConnectedAccountFields } from './adapters/types';

const UPSERT_SQL = `INSERT INTO social_accounts (id,workspace_id,platform,external_id,username,display_name,avatar_url,access_token,refresh_token,token_expires_at,meta,status,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',$12)
     ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, display_name=EXCLUDED.display_name, avatar_url=EXCLUDED.avatar_url,
       access_token=EXCLUDED.access_token, refresh_token=COALESCE(EXCLUDED.refresh_token, social_accounts.refresh_token),
       token_expires_at=EXCLUDED.token_expires_at, meta=EXCLUDED.meta, status='active', last_error=NULL
     RETURNING *`;

export type ConnectResult = { saved: any[]; added: number; updated: number; skipped: number; limit: number };

/**
 * Saves the accounts a login returned. Accounts already connected are refreshed; new ones are added
 * only while the workspace has room under its plan's account limit, and the rest are skipped.
 * Runs in one transaction with the workspace row locked, so two logins at once can't both squeeze
 * past the limit.
 */
export async function connectAccounts(workspaceId: string, platform: string, list: ConnectedAccountFields[]): Promise<ConnectResult> {
  return tx(async (q) => {
    const [ws] = await q('SELECT account_limit FROM workspaces WHERE id=$1 FOR UPDATE', [workspaceId]);
    if (!ws) throw new HttpError(404, 'Workspace not found');
    const limit = Number(ws.account_limit);
    const [{ c }] = await q('SELECT COUNT(*)::int AS c FROM social_accounts WHERE workspace_id=$1', [workspaceId]);
    let count = Number(c);
    const out: ConnectResult = { saved: [], added: 0, updated: 0, skipped: 0, limit };
    for (const f of list) {
      const [existing] = await q('SELECT id FROM social_accounts WHERE workspace_id=$1 AND platform=$2 AND external_id=$3', [workspaceId, platform, f.external_id]);
      if (!existing && count >= limit) { out.skipped++; continue; }
      const id = existing?.id || uid('acc');
      const [row] = await q(UPSERT_SQL, [id, workspaceId, platform, f.external_id, f.username, f.display_name, f.avatar_url ?? null, encrypt(f.access_token), encrypt(f.refresh_token ?? null), f.token_expires_at ?? null, JSON.stringify(f.meta || {}), now()]);
      out.saved.push(row);
      if (existing) out.updated++;
      else { out.added++; count++; }
    }
    return out;
  });
}

/** Inserts or refreshes one connected account, enforcing the workspace's account limit. */
export async function upsertAccount(workspaceId: string, platform: string, f: ConnectedAccountFields) {
  const r = await connectAccounts(workspaceId, platform, [f]);
  if (!r.saved.length) throw new HttpError(402, limitMessage(r.limit));
  return r.saved[0];
}

export const limitMessage = (limit: number) =>
  `Your plan allows ${limit} connected accounts. Upgrade your plan or disconnect an account to add more.`;

/**
 * Accounts beyond the plan's limit (after a downgrade, say). The oldest accounts keep working; the
 * newest ones past the limit are paused until the workspace upgrades or disconnects some.
 */
export async function overLimitAccountIds(workspaceId: string): Promise<Set<string>> {
  const rows = await query(
    `SELECT a.id FROM (
       SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn FROM social_accounts WHERE workspace_id=$1
     ) a, workspaces w WHERE w.id=$1 AND a.rn > w.account_limit`,
    [workspaceId],
  );
  return new Set(rows.map((r: any) => r.id));
}

/** How long a stored Meta profile picture URL is trusted before it is fetched again. */
export const AVATAR_TTL_MS = 2 * 864e5;
const REFRESH_BUDGET_MS = 2500;

/**
 * Refreshes Facebook and Instagram profile pictures that are older than AVATAR_TTL_MS (their URLs
 * expire). Waits at most REFRESH_BUDGET_MS so the dashboard never hangs on Meta; whatever doesn't
 * finish is retried on a later load. Failures keep the old picture.
 */
export async function refreshStaleAvatars(workspaceId: string, fetchAvatar: (a: { platform: string; external_id: string | null; access_token: string | null }) => Promise<string | null>) {
  const rows = await query(
    `SELECT id, platform, external_id, access_token FROM social_accounts
     WHERE workspace_id=$1 AND platform IN ('facebook','instagram') AND status='active'
       AND COALESCE((meta->>'avatar_at')::bigint, 0) < $2
     ORDER BY created_at LIMIT 60`,
    [workspaceId, now() - AVATAR_TTL_MS],
  );
  if (!rows.length) return 0;
  let done = 0;
  const work = Promise.all(rows.map(async (r: any) => {
    let url: string | null = null;
    try { url = await fetchAvatar({ platform: r.platform, external_id: r.external_id, access_token: decrypt(r.access_token) }); } catch { /* keep the old picture */ }
    await exec(`UPDATE social_accounts SET avatar_url=COALESCE($1, avatar_url), meta = meta || jsonb_build_object('avatar_at', $2::bigint) WHERE id=$3`, [url, now(), r.id]);
    done++;
  }));
  await Promise.race([work.catch(() => {}), new Promise((res) => setTimeout(res, REFRESH_BUDGET_MS))]);
  return done;
}
