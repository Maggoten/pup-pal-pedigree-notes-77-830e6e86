-- Phase 1: Advanced Heat Tracking Database Schema Updates
-- Add new columns to calendar_events table for heat status tracking

-- Add status column to track heat prediction vs active state
ALTER TABLE calendar_events 
ADD COLUMN status text DEFAULT 'predicted';

-- Add heat_phase column to track specific phases of heat cycle
ALTER TABLE calendar_events 
ADD COLUMN heat_phase text;

-- Add end_date column to support multi-day heat periods
ALTER TABLE calendar_events 
ADD COLUMN end_date timestamp with time zone;

-- Add index for better performance when querying by dog and status
CREATE INDEX idx_calendar_events_dog_status ON calendar_events(dog_id, status);

-- Add index for date range queries (start and end dates)
CREATE INDEX idx_calendar_events_date_range ON calendar_events(date, end_date);

-- Update existing heat cycle events to have predicted status
UPDATE calendar_events 
SET status = 'predicted' 
WHERE type = 'heat' AND status IS NULL;