import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { exec, now, one, query, tx, uid } from './db';
import { randomToken, sha256 } from './crypto';

export const SESSION_COOKIE = 'sfy_session';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 30;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type User = { id: string; email: string; name: string };
export type Workspace = { id: string; name: string; plan: string; account_limit: number; owner_id: string; prefs: any; role: string };

/* ---------- passwords (scrypt) ---------- */
export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(pw, salt, 64);
  const want = Buffer.from(hash, 'hex');
  return want.length === test.length && crypto.timingSafeEqual(want, test);
}

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

export async function createUser(email: string, password: string, name?: string) {
  const id = uid('usr');
  const wsId = uid('ws');
  const t = now();
  const display = (name || email.split('@')[0]).trim().slice(0, 80);
  await tx(async (q) => {
    await q('INSERT INTO users (id,email,name,password_hash,created_at) VALUES ($1,$2,$3,$4,$5)', [id, email.toLowerCase(), display, hashPassword(password), t]);
    await q('INSERT INTO workspaces (id,name,plan,account_limit,owner_id,prefs,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [wsId, `${display}'s workspace`, 'trial', 15, id, JSON.stringify(DEFAULT_PREFS), t]);
    await q('INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3)', [wsId, id, 'owner']);
  });
  return { id, email, workspaceId: wsId };
}

/* ---------- sessions ---------- */
export async function createSession(userId: string, workspaceId: string | null = null) {
  const token = randomToken(32);
  await exec('INSERT INTO sessions (token_hash,user_id,workspace_id,expires_at) VALUES ($1,$2,$3,$4)', [sha256(token), userId, workspaceId, now() + SESSION_TTL]);
  return token;
}
export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL / 1000,
  });
}
export async function endSession() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) await exec('DELETE FROM sessions WHERE token_hash=$1', [sha256(token)]);
  c.delete(SESSION_COOKIE);
}

async function sessionRow() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = await one('SELECT token_hash, user_id, workspace_id, expires_at FROM sessions WHERE token_hash=$1', [sha256(token)]);
  if (!s || s.expires_at < now()) return null;
  return s;
}

export async function currentUser(): Promise<User | null> {
  const s = await sessionRow();
  if (!s) return null;
  return one<User>('SELECT id,email,name FROM users WHERE id=$1', [s.user_id]);
}

export async function workspacesForUser(userId: string): Promise<Workspace[]> {
  return query<Workspace>(
    `SELECT w.*, m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id
     WHERE m.user_id=$1 ORDER BY (m.role='owner') DESC, w.created_at`,
    [userId],
  );
}

/** Switch the session's active workspace (must be a member). */
export async function switchWorkspace(userId: string, workspaceId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const m = await one('SELECT 1 FROM workspace_members WHERE user_id=$1 AND workspace_id=$2', [userId, workspaceId]);
  if (!token || !m) throw new HttpError(403, 'Not a member of that workspace');
  await exec('UPDATE sessions SET workspace_id=$1 WHERE token_hash=$2', [workspaceId, sha256(token)]);
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
  const s = await sessionRow();
  if (!s) throw new HttpError(401, 'Not signed in');
  const user = await one<User>('SELECT id,email,name FROM users WHERE id=$1', [s.user_id]);
  if (!user) throw new HttpError(401, 'Not signed in');
  const all = await workspacesForUser(user.id);
  const workspace = all.find((w) => w.id === s.workspace_id) || all[0];
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
