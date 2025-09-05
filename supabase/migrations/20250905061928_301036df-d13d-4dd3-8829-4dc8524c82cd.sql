-- Add index for fast upcoming heats queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_type_date 
ON calendar_events (user_id, type, date) 
WHERE type = 'heat';