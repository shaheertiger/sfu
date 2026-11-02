-- Photo metadata stripping: EXIF/GPS/XMP/IPTC are removed from JPEG, PNG and WebP uploads when the
-- upload is confirmed (workspace pref stripMetadata, on by default). What was found is recorded
-- so the library can show "location removed" without keeping the location itself.
ALTER TABLE media ADD COLUMN IF NOT EXISTS metadata_stripped BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE media ADD COLUMN IF NOT EXISTS metadata_had_gps BOOLEAN NOT NULL DEFAULT false;
