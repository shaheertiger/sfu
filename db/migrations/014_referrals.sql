-- Referral program. Every workspace gets a share code (scheduleforyou.com/r/<code>) the first time
-- the owner opens it. A workspace created from someone's link records who sent it and gets a longer
-- trial; when it first pays, the sender's Stripe customer is credited one month of their plan, once.
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS referral_rewarded_at BIGINT;
CREATE INDEX IF NOT EXISTS workspaces_referred_by_idx ON workspaces(referred_by);
