-- Fix existing negative cycle_length values in heat_cycles table
UPDATE heat_cycles 
SET cycle_length = CASE 
  WHEN end_date IS NOT NULL AND start_date IS NOT NULL 
  THEN CEIL(EXTRACT(EPOCH FROM (end_date - start_date)) / (60 * 60 * 24))
  ELSE NULL 
END
WHERE cycle_length < 0;