-- Monthly or yearly billing, copied from the workspace's Stripe subscription.
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS billing_interval TEXT;
