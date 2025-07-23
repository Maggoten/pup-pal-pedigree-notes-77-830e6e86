-- Phase 1a: Clean up existing duplicates before adding constraints

-- Remove duplicate weight logs, keeping only the earliest created entry for each combination
DELETE FROM puppy_weight_logs 
WHERE id NOT IN (
  SELECT DISTINCT ON (puppy_id, date, weight) id
  FROM puppy_weight_logs
  ORDER BY puppy_id, date, weight, created_at ASC
);

-- Remove duplicate height logs, keeping only the earliest created entry for each combination  
DELETE FROM puppy_height_logs 
WHERE id NOT IN (
  SELECT DISTINCT ON (puppy_id, date, height) id
  FROM puppy_height_logs
  ORDER BY puppy_id, date, height, created_at ASC
);

-- Remove duplicate notes, keeping only the earliest created entry for each combination
DELETE FROM puppy_notes 
WHERE id NOT IN (
  SELECT DISTINCT ON (puppy_id, date, content) id
  FROM puppy_notes
  ORDER BY puppy_id, date, content, created_at ASC
);

-- Now add RLS policies for UPDATE and DELETE operations
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

-- Add unique constraints to prevent future duplicates
CREATE UNIQUE INDEX unique_puppy_weight_log 
ON puppy_weight_logs (puppy_id, date, weight);

CREATE UNIQUE INDEX unique_puppy_height_log 
ON puppy_height_logs (puppy_id, date, height);

CREATE UNIQUE INDEX unique_puppy_note 
ON puppy_notes (puppy_id, date, content);