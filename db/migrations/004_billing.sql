-- Stripe billing, one subscription per workspace. The 7-day free trial runs inside Stripe and
-- needs a card: the workspace owner starts it through Checkout, and Stripe charges on day 8.
ALTER TABLE workspaces ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE workspaces ADD COLUMN stripe_subscription_id TEXT;
-- Stripe subscription status (trialing, active, past_due, canceled, …), or 'comped' for free access set by hand.
ALTER TABLE workspaces ADD COLUMN subscription_status TEXT;
-- When the Stripe trial ends (null when not trialing).
ALTER TABLE workspaces ADD COLUMN trial_ends_at BIGINT;
-- A workspace gets one free trial.
ALTER TABLE workspaces ADD COLUMN trial_used BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE workspaces ADD COLUMN current_period_end BIGINT;
ALTER TABLE workspaces ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- Webhook events already handled (Stripe can deliver an event more than once).
CREATE TABLE stripe_events (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
