-- Add pregnancy_id column to calendar_events table
-- This enables linking calendar events to specific pregnancies for selective cleanup

ALTER TABLE public.calendar_events 
ADD COLUMN pregnancy_id UUID REFERENCES public.pregnancies(id) ON DELETE CASCADE;