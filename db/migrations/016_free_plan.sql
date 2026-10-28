-- Free plan (lib/plan-limits.js): a workspace without a paid plan is on Free instead of being unable
-- to publish. Free connects 3 accounts; the app enforces it from the subscription status, and this
-- keeps the stored columns in step. Accounts past the limit are paused (oldest kept), not removed.
UPDATE workspaces SET plan = 'free', account_limit = 3
WHERE subscription_status IS NULL OR subscription_status NOT IN ('active', 'trialing', 'past_due', 'comped');
