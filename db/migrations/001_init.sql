-- Schedule For You: initial schema. Times are epoch milliseconds (BIGINT).

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  password_hash TEXT NOT NULL,
  created_at    BIGINT NOT NULL
);

CREATE TABLE workspaces (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'trial',
  account_limit INTEGER NOT NULL DEFAULT 15,
  owner_id      TEXT NOT NULL REFERENCES users(id),
  -- Timezone, posting slots, labels, folders, templates, hashtag groups, calendar notes, reminder settings.
  prefs         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    BIGINT NOT NULL
);

CREATE TABLE workspace_members (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (workspace_id, user_id)
);
CREATE INDEX idx_members_user ON workspace_members(user_id);

-- Only a hash of the session token is stored.
CREATE TABLE sessions (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE SET NULL,
  expires_at   BIGINT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- access_token / refresh_token are encrypted at rest (AES-256-GCM, see lib/server/crypto.ts).
CREATE TABLE social_accounts (
  id               TEXT PRIMARY KEY,
  workspace_id     TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL,
  external_id      TEXT,
  username         TEXT,
  display_name     TEXT,
  avatar_url       TEXT,
  access_token     TEXT,
  refresh_token    TEXT,
  token_expires_at BIGINT,
  meta             JSONB NOT NULL DEFAULT '{}'::jsonb,
  status           TEXT NOT NULL DEFAULT 'active',
  last_error       TEXT,
  created_at       BIGINT NOT NULL,
  UNIQUE (workspace_id, platform, external_id)
);

-- Files live in Cloudflare R2; object_key is the key inside the bucket.
CREATE TABLE media (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  filename     TEXT NOT NULL,
  object_key   TEXT NOT NULL,
  mime         TEXT NOT NULL,
  size         BIGINT NOT NULL DEFAULT 0,
  folder       TEXT,
  uploaded     BOOLEAN NOT NULL DEFAULT false,
  created_at   BIGINT NOT NULL
);
CREATE INDEX idx_media_ws ON media(workspace_id, created_at DESC);

CREATE TABLE posts (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  caption      TEXT NOT NULL DEFAULT '',
  media        JSONB NOT NULL DEFAULT '[]'::jsonb,   -- array of media ids
  scheduled_at BIGINT,
  status       TEXT NOT NULL DEFAULT 'draft',        -- draft | scheduled | publishing | published | partial | failed
  labels       JSONB NOT NULL DEFAULT '[]'::jsonb,
  repeat       TEXT NOT NULL DEFAULT 'none',         -- none | weekly | monthly
  evergreen    BOOLEAN NOT NULL DEFAULT false,
  approval     TEXT,                                 -- null | pending | approved
  remind       BOOLEAN NOT NULL DEFAULT true,
  note         TEXT NOT NULL DEFAULT '',
  batch        TEXT,
  parent_id    TEXT,                                 -- the post a repeat/evergreen copy came from
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   BIGINT NOT NULL,
  updated_at   BIGINT NOT NULL
);
CREATE INDEX idx_posts_due ON posts(status, scheduled_at);
CREATE INDEX idx_posts_ws ON posts(workspace_id, scheduled_at);
CREATE UNIQUE INDEX idx_posts_parent ON posts(parent_id) WHERE parent_id IS NOT NULL;

CREATE TABLE post_targets (
  id               TEXT PRIMARY KEY,
  post_id          TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  account_id       TEXT NOT NULL,
  caption_override TEXT,
  options          JSONB NOT NULL DEFAULT '{}'::jsonb,
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending | publishing | published | failed
  external_id      TEXT,
  external_url     TEXT,
  error            TEXT,
  attempts         INTEGER NOT NULL DEFAULT 0,
  published_at     BIGINT,
  stats            JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_targets_post ON post_targets(post_id);

CREATE TABLE api_keys (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  key_hash     TEXT NOT NULL UNIQUE,
  prefix       TEXT NOT NULL,
  created_at   BIGINT NOT NULL,
  last_used_at BIGINT
);

CREATE TABLE invites (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
  role         TEXT NOT NULL DEFAULT 'member',
  created_at   BIGINT NOT NULL,
  accepted_at  BIGINT
);

CREATE TABLE oauth_states (
  state         TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  code_verifier TEXT,
  created_at    BIGINT NOT NULL
);
