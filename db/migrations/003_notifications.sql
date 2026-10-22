-- Email notifications (Resend): reminders, failure alerts, daily digest.
-- The scheduled_at a reminder was sent for, so rescheduling a post re-arms its reminder.
ALTER TABLE posts ADD COLUMN reminded_for BIGINT;
-- When a target gave up for good (for the digest).
ALTER TABLE post_targets ADD COLUMN failed_at BIGINT;
-- Last daily digest: when, and for which local date (workspace timezone).
ALTER TABLE workspaces ADD COLUMN digest_sent_at BIGINT;
ALTER TABLE workspaces ADD COLUMN digest_sent_on TEXT;
