import 'server-only';
import { now, one, query, uid } from './db';
import { encrypt } from './crypto';
import { HttpError } from './auth';
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
