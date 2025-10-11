-- Migration: Add attachments column to sessions table
-- Run this in your Supabase SQL Editor

-- Add attachments column to store file information as JSONB
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Add a comment to document the column
COMMENT ON COLUMN sessions.attachments IS 'Array of file attachments with name, path, publicUrl, and size';

-- Example of what the data looks like:
-- [
--   {
--     "name": "homework.pdf",
--     "path": "sessions/user-id/homework-123.pdf",
--     "publicUrl": "https://...",
--     "size": 1024000
--   }
-- ]

-- Optional: Create an index if you plan to query by attachments
-- CREATE INDEX IF NOT EXISTS idx_sessions_attachments ON sessions USING gin(attachments);
