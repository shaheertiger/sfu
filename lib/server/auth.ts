import 'server-only';
import { exec, now, one, query, tx, uid } from './db';
import { randomToken, sha256 } from './crypto';
import { neonAuth } from './neon-auth';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type User = { id: string; email: string; name: string };
export type Workspace = { id: string; name: string; plan: string; account_limit: number; owner_id: string; prefs: any; role: string };

/* ---------- users + workspaces ---------- */
export const DEFAULT_PREFS = {
  tz: 'America/New_York',
  remind: { on: true, lead: 60 },
  alerts: { fail: true, digest: true },
  slots: ['09:00', '12:30', '17:30'],
  slotDays: [1, 2, 3, 4, 5],
  paused: false,
  labels: ['Launch', 'Promo', 'Tutorial', 'Community', 'Evergreen'],
  folders: ['Product shots', 'Reels', 'Archive'],
  templates: [
    { name: 'Launch', text: "It's live: [product]. [One line on why it matters]. Link in bio." },
    { name: 'Weekly tip', text: 'Tuesday tip: [the tip]. Try it this week and tell me how it went.' },
    { name: 'Behind the scenes', text: 'Behind the scenes of [project]. [What surprised us].' },
  ],
  tagGroups: [],
  notes: {},
};

type NeonUser = { id: string; email: string; name?: string | null };

/**
 * Returns the app's profile row for a Neon Auth user, creating it (with a first workspace) on first sign-in.
 * Neon Auth owns passwords and sessions; `users` keeps the profile that workspaces and posts point at.
 */
export async function ensureUser(nu: NeonUser): Promise<User & { active_workspace_id: string | null }> {
  const found = await one('SELECT id,email,name,active_workspace_id FROM users WHERE id=$1', [nu.id]);
  if (found) return found;
  const email = nu.email.toLowerCase();
  if (await one('SELECT 1 FROM users WHERE email=$1 AND id<>$2', [email, nu.id])) {
    throw new HttpError(409, 'An older account already uses this email. Contact support to move it to the new sign-in.');
  }
  const display = (nu.name || email.split('@')[0]).trim().slice(0, 80);
  const wsId = uid('ws');
  const t = now();
  await tx(async (q) => {
    // ON CONFLICT: two first requests can race; only the one that inserts creates the workspace.
    const ins = await q('INSERT INTO users (id,email,name,created_at,active_workspace_id) VALUES ($1,$2,$3,$4,NULL) ON CONFLICT (id) DO NOTHING RETURNING id', [nu.id, email, display, t]);
    if (!ins.length) return;
    await q('INSERT INTO workspaces (id,name,plan,account_limit,owner_id,prefs,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [wsId, `${display}'s workspace`, 'trial', 15, nu.id, JSON.stringify(DEFAULT_PREFS), t]);
    await q('INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3)', [wsId, nu.id, 'owner']);
    await q('UPDATE users SET active_workspace_id=$1 WHERE id=$2', [wsId, nu.id]);
  });
  return (await one('SELECT id,email,name,active_workspace_id FROM users WHERE id=$1', [nu.id]))!;
}

/* ---------- sessions (Neon Auth) ---------- */
async function sessionUser() {
  const { data, error } = await neonAuth().getSession();
  if (error) console.error('[auth] getSession failed:', error.message);
  const nu = data?.user;
  return nu ? ensureUser(nu) : null;
}

export async function currentUser(): Promise<User | null> {
  const u = await sessionUser();
  return u && { id: u.id, email: u.email, name: u.name };
}

export async function workspacesForUser(userId: string): Promise<Workspace[]> {
  return query<Workspace>(
    `SELECT w.*, m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id
     WHERE m.user_id=$1 ORDER BY (m.role='owner') DESC, w.created_at`,
    [userId],
  );
}

/** Switch the user's active workspace (must be a member). */
export async function switchWorkspace(userId: string, workspaceId: string) {
  const m = await one('SELECT 1 FROM workspace_members WHERE user_id=$1 AND workspace_id=$2', [userId, workspaceId]);
  if (!m) throw new HttpError(403, 'Not a member of that workspace');
  await exec('UPDATE users SET active_workspace_id=$1 WHERE id=$2', [workspaceId, userId]);
}

/** Resolves the acting workspace from an API key (Bearer) or the session cookie. */
export async function requireWorkspace(req?: Request): Promise<{ workspace: Workspace; user: User | null }> {
  const authHeader = req?.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const row = await one('SELECT * FROM api_keys WHERE key_hash=$1', [sha256(authHeader.slice(7).trim())]);
    if (!row) throw new HttpError(401, 'Invalid API key');
    await exec('UPDATE api_keys SET last_used_at=$1 WHERE id=$2', [now(), row.id]);
    const ws = await one('SELECT * FROM workspaces WHERE id=$1', [row.workspace_id]);
    return { workspace: { ...ws, role: 'api' }, user: null };
  }
  const u = await sessionUser();
  if (!u) throw new HttpError(401, 'Not signed in');
  const user = { id: u.id, email: u.email, name: u.name };
  const all = await workspacesForUser(user.id);
  const workspace = all.find((w) => w.id === u.active_workspace_id) || all[0];
  if (!workspace) throw new HttpError(403, 'No workspace');
  return { workspace, user };
}

/* ---------- API keys ---------- */
export async function createApiKey(workspaceId: string, name: string) {
  const raw = 'sfy_' + randomToken(24);
  const id = uid('key');
  await exec('INSERT INTO api_keys (id,workspace_id,name,key_hash,prefix,created_at) VALUES ($1,$2,$3,$4,$5,$6)', [id, workspaceId, name, sha256(raw), raw.slice(0, 8), now()]);
  return { id, key: raw, prefix: raw.slice(0, 8) };
}
