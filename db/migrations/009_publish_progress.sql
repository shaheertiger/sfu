-- What a publish attempt saved for the next one: an Instagram container id still processing, or a
-- `sending` mark set right before the request that creates the post (so a lost answer is never
-- blindly sent again).
ALTER TABLE post_targets ADD COLUMN IF NOT EXISTS progress JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Repeating posts step from a fixed series anchor (the first occurrence) in the workspace's timezone,
-- so retries, "publish now" and short months never shift later occurrences. repeat_n is this post's
-- occurrence number in the series (0 = the anchor).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repeat_anchor BIGINT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS repeat_n INTEGER NOT NULL DEFAULT 0;
UPDATE posts SET repeat_anchor = scheduled_at
  WHERE repeat IN ('weekly', 'monthly') AND repeat_anchor IS NULL AND scheduled_at IS NOT NULL;

-- Facebook Page connections no longer keep the long-lived user token (it was stored unencrypted and unused).
UPDATE social_accounts SET meta = meta - 'user_token' WHERE meta ? 'user_token';
-- Facebook Page tokens obtained from a long-lived user token don't expire.
UPDATE social_accounts SET meta = meta || '{"token_kind":"page"}'::jsonb WHERE platform = 'facebook' AND NOT meta ? 'token_kind';
