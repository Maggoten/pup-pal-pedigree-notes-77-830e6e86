-- Clean up heat history data and duplicate reminders

-- Step 1: Clean up duplicate "Start Heat Tracking" reminders
DELETE FROM reminders 
WHERE source = 'system' 
  AND title LIKE '%Start Heat Tracking%' 
  AND created_at < NOW() - INTERVAL '1 hour';

-- Step 2: Reset heat history for dogs that have null or corrupted data
-- This will allow users to re-enter their heat data
UPDATE dogs 
SET "heatHistory" = '[]'::jsonb
WHERE "heatHistory" IS NULL 
   OR "heatHistory" = 'null'::jsonb
   OR jsonb_typeof("heatHistory") != 'array';

-- Step 3: Clean up any heat history entries with invalid dates
UPDATE dogs 
SET "heatHistory" = (
  SELECT jsonb_agg(entry)
  FROM jsonb_array_elements(dogs."heatHistory") AS entry
  WHERE entry ? 'date' 
    AND entry->>'date' IS NOT NULL 
    AND entry->>'date' != ''
    AND entry->>'date' ~ '^\d{4}-\d{2}-\d{2}'
)
WHERE jsonb_array_length(dogs."heatHistory") > 0;

-- Step 4: Set empty array for dogs where all entries were invalid
UPDATE dogs 
SET "heatHistory" = '[]'::jsonb
WHERE "heatHistory" IS NULL;