-- Automations: post signatures, outgoing webhooks, RSS auto-post, client preview links.

-- Signature added to the end of every post when it publishes (per-post opt-out via posts.signature).
ALTER TABLE workspaces ADD COLUMN signature TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN signature BOOLEAN NOT NULL DEFAULT true;

-- Outgoing webhooks: a signed JSON POST when a post publishes or fails.
CREATE TABLE webhooks (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  secret       TEXT NOT NULL,
  events       JSONB NOT NULL DEFAULT '["post.published","post.failed"]'::jsonb,
  active       BOOLEAN NOT NULL DEFAULT true,
  last_status  INTEGER,
  last_error   TEXT,
  last_sent_at BIGINT,
  created_at   BIGINT NOT NULL
);
CREATE INDEX idx_webhooks_ws ON webhooks(workspace_id);

-- RSS auto-post: new feed items become drafts or queued posts.
CREATE TABLE rss_feeds (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  title           TEXT,
  mode            TEXT NOT NULL DEFAULT 'draft',   -- draft | queue
  template        TEXT NOT NULL DEFAULT '{title}

{link}',
  account_ids     JSONB NOT NULL DEFAULT '[]'::jsonb,
  active          BOOLEAN NOT NULL DEFAULT true,
  last_checked_at BIGINT,
  last_error      TEXT,
  created_at      BIGINT NOT NULL
);
CREATE INDEX idx_rss_feeds_ws ON rss_feeds(workspace_id);
CREATE TABLE rss_items (
  feed_id    TEXT NOT NULL REFERENCES rss_feeds(id) ON DELETE CASCADE,
  guid       TEXT NOT NULL,
  post_id    TEXT,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (feed_id, guid)
);

-- Client preview links: anyone with the link can view a post, approve it or comment.
CREATE TABLE post_shares (
  token        TEXT PRIMARY KEY,
  post_id      TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by   TEXT,
  created_at   BIGINT NOT NULL,
  expires_at   BIGINT NOT NULL
);
CREATE INDEX idx_post_shares_post ON post_shares(post_id);
CREATE TABLE post_comments (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  body       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'comment',   -- comment | approved | changes
  source     TEXT NOT NULL DEFAULT 'client',    -- client | team
  created_at BIGINT NOT NULL
);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
