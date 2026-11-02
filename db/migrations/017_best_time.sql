-- First-party "best time to post" data and anonymous tool usage caps.

-- Scheduled/published volume (and link clicks) per platform, region, local weekday and hour,
-- aggregated daily by /api/cron/best-time from post_targets over the last 90 days. No per-user
-- data: only counts. region is an ISO country code ('US', 'GB', …) or 'GLOBAL'.
CREATE TABLE IF NOT EXISTS best_time_stats (
  platform    TEXT     NOT NULL,
  region      TEXT     NOT NULL,
  weekday     SMALLINT NOT NULL,   -- 0 = Sunday … 6 = Saturday, in the workspace's timezone
  hour        SMALLINT NOT NULL,   -- 0–23, in the workspace's timezone
  posts       INTEGER  NOT NULL DEFAULT 0,
  clicks      INTEGER  NOT NULL DEFAULT 0,
  computed_at BIGINT   NOT NULL,
  PRIMARY KEY (platform, region, weekday, hour)
);

-- Anonymous (signed-out) calls to public tool endpoints, counted per hashed visitor per UTC day so
-- free tools can be used without an account but not scraped. Rows expire after a day (cron cleanup).
CREATE TABLE IF NOT EXISTS anon_tool_usage (
  key        TEXT    PRIMARY KEY,   -- sha256(salt + ip + user-agent + tool + day)
  day        TEXT    NOT NULL,      -- YYYY-MM-DD (UTC)
  count      INTEGER NOT NULL DEFAULT 0,
  updated_at BIGINT  NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_anon_tool_usage_day ON anon_tool_usage(day);
