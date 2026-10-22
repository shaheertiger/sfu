-- The free trial now needs a card and runs in Stripe (status 'trialing'), so trial_ends_at is
-- set from Stripe instead of defaulting to created_at + 7 days. A workspace gets one free trial.
ALTER TABLE workspaces ALTER COLUMN trial_ends_at DROP DEFAULT;
UPDATE workspaces SET trial_ends_at = NULL WHERE subscription_status IS DISTINCT FROM 'trialing';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS trial_used BOOLEAN NOT NULL DEFAULT false;
