-- Phase 1: Fix RLS policies for puppy weight and height logs to allow UPDATE and DELETE operations
-- and add unique constraints to prevent duplicates

-- Update RLS policies for puppy_weight_logs to allow UPDATE and DELETE
CREATE POLICY "Users can update their own puppy weight logs" 
ON puppy_weight_logs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_weight_logs.puppy_id 
  AND l.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own puppy weight logs" 
ON puppy_weight_logs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_weight_logs.puppy_id 
  AND l.user_id = auth.uid()
));

-- Update RLS policies for puppy_height_logs to allow UPDATE and DELETE
CREATE POLICY "Users can update their own puppy height logs" 
ON puppy_height_logs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_height_logs.puppy_id 
  AND l.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own puppy height logs" 
ON puppy_height_logs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_height_logs.puppy_id 
  AND l.user_id = auth.uid()
));

-- Add unique constraints to prevent duplicate entries
-- For weight logs: unique combination of puppy_id, date, and weight
CREATE UNIQUE INDEX unique_puppy_weight_log 
ON puppy_weight_logs (puppy_id, date, weight);

-- For height logs: unique combination of puppy_id, date, and height  
CREATE UNIQUE INDEX unique_puppy_height_log 
ON puppy_height_logs (puppy_id, date, height);

-- Update RLS policies for puppy_notes to allow UPDATE and DELETE (for consistency)
CREATE POLICY "Users can update their own puppy notes" 
ON puppy_notes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_notes.puppy_id 
  AND l.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own puppy notes" 
ON puppy_notes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_notes.puppy_id 
  AND l.user_id = auth.uid()
));