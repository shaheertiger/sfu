-- Accounts a Facebook or Instagram login returned, waiting for the person to choose which to connect.
-- The payload (with access tokens) is encrypted; rows expire after 30 minutes.
CREATE TABLE IF NOT EXISTS pending_connections (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  payload      TEXT NOT NULL,
  created_at   BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pending_connections_created ON pending_connections(created_at);
