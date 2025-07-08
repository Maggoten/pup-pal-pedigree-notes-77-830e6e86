-- Clean up the database constraints and duplicates properly
-- First, drop the constraint instead of the index
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS unique_system_reminder;

-- Create a better unique index for system reminders
CREATE UNIQUE INDEX unique_system_reminder_v2 ON reminders (user_id, type, title, due_date) 
WHERE source = 'system' AND is_deleted = false;

-- Clean up any existing duplicate reminders
WITH duplicate_reminders AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, type, title, due_date 
    ORDER BY created_at DESC
  ) as rn
  FROM reminders 
  WHERE source = 'system' AND is_deleted = false
)
UPDATE reminders 
SET is_deleted = true 
WHERE id IN (
  SELECT id FROM duplicate_reminders WHERE rn > 1
);

-- Clean up any reminders with invalid UUIDs (cast UUID to text for regex check)
UPDATE reminders 
SET is_deleted = true 
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Add a function to clean up old completed system reminders automatically
CREATE OR REPLACE FUNCTION cleanup_old_system_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete system reminders that are completed and older than 30 days
  DELETE FROM reminders 
  WHERE source = 'system' 
    AND is_completed = true 
    AND updated_at < NOW() - INTERVAL '30 days';
END;
$$;