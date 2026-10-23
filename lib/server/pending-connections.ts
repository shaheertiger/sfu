import 'server-only';
import { exec, now, one, query, uid } from './db';
import { decrypt, encrypt } from './crypto';
import type { ConnectedAccountFields } from './adapters/types';

/**
 * When a login returns several new accounts (a person managing many Facebook Pages), they choose
 * which to connect instead of all of them being imported. The accounts wait here, encrypted, for
 * 30 minutes.
 */
export const PENDING_TTL_MS = 30 * 60_000;

/** Which of the returned accounts are new to this workspace, and which are already connected. */
export async function splitNew(workspaceId: string, platform: string, accounts: ConnectedAccountFields[]) {
  const rows = accounts.length
    ? await query('SELECT external_id FROM social_accounts WHERE workspace_id=$1 AND platform=$2 AND external_id = ANY($3)', [workspaceId, platform, accounts.map((a) => a.external_id)])
    : [];
  const have = new Set(rows.map((r: any) => r.external_id));
  return { known: accounts.filter((a) => have.has(a.external_id)), fresh: accounts.filter((a) => !have.has(a.external_id)) };
}

export async function stashConnection(workspaceId: string, platform: string, accounts: ConnectedAccountFields[]) {
  await exec('DELETE FROM pending_connections WHERE created_at < $1', [now() - PENDING_TTL_MS]);
  const id = uid('pick');
  await exec('INSERT INTO pending_connections (id,workspace_id,platform,payload,created_at) VALUES ($1,$2,$3,$4,$5)', [id, workspaceId, platform, encrypt(JSON.stringify(accounts)), now()]);
  return id;
}

export async function loadPending(workspaceId: string, id: string): Promise<{ platform: string; accounts: ConnectedAccountFields[] } | null> {
  const row = await one('SELECT * FROM pending_connections WHERE id=$1 AND workspace_id=$2', [id, workspaceId]);
  if (!row || Number(row.created_at) < now() - PENDING_TTL_MS) return null;
  return { platform: row.platform, accounts: JSON.parse(decrypt(row.payload) || '[]') };
}

export const dropPending = (id: string) => exec('DELETE FROM pending_connections WHERE id=$1', [id]);

/** What the picker shows: names and pictures, never tokens. */
export const pickerView = (a: ConnectedAccountFields) => ({ external_id: a.external_id, name: a.display_name || a.username, username: a.username, avatar: a.avatar_url || null });
