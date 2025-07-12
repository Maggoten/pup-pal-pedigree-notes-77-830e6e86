-- First, identify and clean up duplicate system reminders
-- Keep only the most recent reminder for each user+type+related_id+due_date+source combination
-- This ensures we preserve manually added reminders (source = 'custom')
WITH duplicate_reminders AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, type, related_id, due_date, source 
      ORDER BY created_at DESC, updated_at DESC
    ) as rn
  FROM public.reminders
  WHERE source = 'system'
    AND is_deleted = false
),
reminders_to_delete AS (
  SELECT id 
  FROM duplicate_reminders 
  WHERE rn > 1
)
DELETE FROM public.reminders 
WHERE id IN (SELECT id FROM reminders_to_delete);

-- Add composite unique constraint to prevent future duplicate system reminders
ALTER TABLE public.reminders 
ADD CONSTRAINT unique_system_reminder 
UNIQUE (user_id, type, related_id, due_date, source) 
DEFERRABLE INITIALLY DEFERRED;

-- Add index to improve performance for duplicate checks
CREATE INDEX IF NOT EXISTS idx_reminders_system_duplicate_check 
ON public.reminders (user_id, type, related_id, source, is_deleted) 
WHERE source = 'system' AND is_deleted = false;