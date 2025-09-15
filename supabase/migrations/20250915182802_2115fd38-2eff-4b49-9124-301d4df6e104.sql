-- Clean up existing system heat reminders that don't have translation data
-- This will force regeneration with proper translation fields

DELETE FROM public.reminders 
WHERE type = 'heat' 
AND source = 'system' 
AND (title_key IS NULL OR description_key IS NULL OR translation_data IS NULL);