-- Link click tracking: when a workspace turns it on, links in captions and first comments are
-- replaced by short links on the app's domain when a post publishes, and each visit is counted.
CREATE TABLE IF NOT EXISTS links (
  code          TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  post_id       TEXT REFERENCES posts(id) ON DELETE SET NULL,
  target_id     TEXT,
  url           TEXT NOT NULL,
  clicks        INTEGER NOT NULL DEFAULT 0,
  created_at    BIGINT NOT NULL,
  last_click_at BIGINT
);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_id);
CREATE INDEX IF NOT EXISTS idx_links_ws ON links(workspace_id, created_at DESC);
