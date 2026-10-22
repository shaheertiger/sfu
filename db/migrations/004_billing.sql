-- Stripe billing, one subscription per workspace. New workspaces get a 7-day trial (no card).
ALTER TABLE workspaces ADD COLUMN trial_ends_at BIGINT
  DEFAULT ((extract(epoch from now()) * 1000)::bigint + 7 * 86400000);
UPDATE workspaces SET trial_ends_at = created_at + 7 * 86400000;
ALTER TABLE workspaces ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE workspaces ADD COLUMN stripe_subscription_id TEXT;
-- Stripe subscription status (active, trialing, past_due, canceled, …), or 'comped' for free access set by hand.
ALTER TABLE workspaces ADD COLUMN subscription_status TEXT;
ALTER TABLE workspaces ADD COLUMN current_period_end BIGINT;
ALTER TABLE workspaces ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- Webhook events already handled (Stripe can deliver an event more than once).
CREATE TABLE stripe_events (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
