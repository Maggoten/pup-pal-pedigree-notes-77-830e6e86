-- Add composite unique constraint to prevent duplicate system reminders
-- This constraint ensures one reminder per user+type+related_id+due_date combination
-- It only applies to system reminders to avoid affecting custom reminders
ALTER TABLE public.reminders 
ADD CONSTRAINT unique_system_reminder 
UNIQUE (user_id, type, related_id, due_date, source) 
DEFERRABLE INITIALLY DEFERRED;

-- Add index to improve performance for duplicate checks
CREATE INDEX IF NOT EXISTS idx_reminders_system_duplicate_check 
ON public.reminders (user_id, type, related_id, source, is_deleted) 
WHERE source = 'system' AND is_deleted = false;