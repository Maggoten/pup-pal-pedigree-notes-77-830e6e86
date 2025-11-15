-- Add status column with default value
ALTER TABLE planned_litters 
ADD COLUMN status text NOT NULL DEFAULT 'planned';

-- Add litter_id reference column
ALTER TABLE planned_litters 
ADD COLUMN litter_id uuid REFERENCES litters(id) ON DELETE SET NULL;

-- Add completed_at timestamp
ALTER TABLE planned_litters 
ADD COLUMN completed_at timestamp with time zone;

-- Add index for performance on status queries
CREATE INDEX idx_planned_litters_status ON planned_litters(status);

-- Add index for litter_id lookups
CREATE INDEX idx_planned_litters_litter_id ON planned_litters(litter_id);

-- Add constraint to ensure completed planned litters have a litter_id
ALTER TABLE planned_litters
ADD CONSTRAINT check_completed_has_litter 
CHECK (
  (status = 'completed' AND litter_id IS NOT NULL) 
  OR 
  (status != 'completed')
);

-- Backfill existing planned litters to determine their status
-- If they have mating dates, mark as 'active', otherwise 'planned'
UPDATE planned_litters pl
SET status = CASE 
  WHEN EXISTS (
    SELECT 1 FROM mating_dates md 
    WHERE md.planned_litter_id = pl.id
  ) THEN 'active'
  ELSE 'planned'
END;