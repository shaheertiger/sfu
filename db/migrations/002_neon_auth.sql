-- Sign-in moved to Neon Auth (Managed Better Auth). Passwords and sessions now live in the
-- neon_auth schema. users.id is the Neon Auth user id; the row is created on first sign-in.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
-- The workspace the user last switched to (was stored per session).
ALTER TABLE users ADD COLUMN active_workspace_id TEXT REFERENCES workspaces(id) ON DELETE SET NULL;
DROP TABLE sessions;
