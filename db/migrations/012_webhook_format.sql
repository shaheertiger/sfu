-- Webhooks can post in the shape Slack and Discord incoming webhooks expect, not only our JSON.
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'json';
