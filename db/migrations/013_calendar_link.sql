-- Shared calendar: a read-only link (and iCal feed) to the workspace's schedule for clients and teammates.
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS calendar_token TEXT UNIQUE;
