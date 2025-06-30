
-- Add a unique constraint to prevent duplicate system-generated reminders
-- This will help us avoid creating duplicate entries for auto-generated reminders
ALTER TABLE public.reminders 
ADD CONSTRAINT unique_system_reminder 
UNIQUE (user_id, type, related_id, due_date) 
DEFERRABLE INITIALLY DEFERRED;

-- Add an index to improve performance for reminder queries
CREATE INDEX IF NOT EXISTS idx_reminders_user_type_related 
ON public.reminders (user_id, type, related_id, is_deleted, is_completed);

-- Add a source column to track whether reminder is custom or system-generated
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'custom';

-- Update existing reminders to mark them as custom
UPDATE public.reminders 
SET source = 'custom' 
WHERE source IS NULL OR source = 'custom';
