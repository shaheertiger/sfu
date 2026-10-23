import 'server-only';
import { exec, now, one, query, uid } from './db';
import { decrypt, encrypt } from './crypto';
import { HttpError } from './http-error';
import type { ConnectedAccountFields } from './adapters/types';

/** Inserts or refreshes a connected account, enforcing the workspace's account limit. */
export async function upsertAccount(workspaceId: string, platform: string, f: ConnectedAccountFields) {
  const existing = await one('SELECT id FROM social_accounts WHERE workspace_id=$1 AND platform=$2 AND external_id=$3', [workspaceId, platform, f.external_id]);
  if (!existing) {
    const ws = await one('SELECT account_limit FROM workspaces WHERE id=$1', [workspaceId]);
    const { c } = (await one('SELECT COUNT(*)::int AS c FROM social_accounts WHERE workspace_id=$1', [workspaceId]))!;
    if (c >= ws.account_limit) throw new HttpError(402, `Account limit (${ws.account_limit}) reached`);
  }
  const id = existing?.id || uid('acc');
  const rows = await query(
    `INSERT INTO social_accounts (id,workspace_id,platform,external_id,username,display_name,avatar_url,access_token,refresh_token,token_expires_at,meta,status,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active',$12)
     ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, display_name=EXCLUDED.display_name, avatar_url=EXCLUDED.avatar_url,
       access_token=EXCLUDED.access_token, refresh_token=COALESCE(EXCLUDED.refresh_token, social_accounts.refresh_token),
       token_expires_at=EXCLUDED.token_expires_at, meta=EXCLUDED.meta, status='active', last_error=NULL
     RETURNING *`,
    [id, workspaceId, platform, f.external_id, f.username, f.display_name, f.avatar_url ?? null, encrypt(f.access_token), encrypt(f.refresh_token ?? null), f.token_expires_at ?? null, JSON.stringify(f.meta || {}), now()],
  );
  return rows[0];
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
