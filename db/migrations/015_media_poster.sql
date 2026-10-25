-- A still frame for each video, made in the browser at upload (or backfilled on first view), so the
-- library, queue and composer never load the video itself just to show a thumbnail.
ALTER TABLE media ADD COLUMN IF NOT EXISTS poster_key TEXT;
