-- Clean up old track heat cycle reminders
DELETE FROM reminders 
WHERE title ILIKE '%Track%Heat Cycle%';