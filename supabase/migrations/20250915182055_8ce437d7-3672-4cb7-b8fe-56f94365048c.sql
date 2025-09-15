-- Add columns for translation support in reminders table
ALTER TABLE public.reminders 
ADD COLUMN title_key text,
ADD COLUMN description_key text,
ADD COLUMN translation_data jsonb;