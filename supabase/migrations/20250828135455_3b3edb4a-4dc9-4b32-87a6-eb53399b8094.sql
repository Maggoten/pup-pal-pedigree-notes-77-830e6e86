-- Clean up duplicate due-date events
-- This removes duplicate due-date events keeping only the most recent one for each user
WITH duplicate_due_dates AS (
  SELECT 
    id,
    user_id,
    title,
    date,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, title, date 
      ORDER BY created_at DESC
    ) as rn
  FROM calendar_events 
  WHERE type = 'due-date'
)
DELETE FROM calendar_events 
WHERE id IN (
  SELECT id 
  FROM duplicate_due_dates 
  WHERE rn > 1
);