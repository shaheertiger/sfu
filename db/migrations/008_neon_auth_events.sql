-- Neon Auth webhook deliveries already handled (event id), so Neon's retries don't send a second auth email.
-- Rows only matter for the seconds Neon retries; the webhook trims rows older than a week.
CREATE TABLE IF NOT EXISTS neon_auth_events (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_neon_auth_events_created ON neon_auth_events(created_at);
