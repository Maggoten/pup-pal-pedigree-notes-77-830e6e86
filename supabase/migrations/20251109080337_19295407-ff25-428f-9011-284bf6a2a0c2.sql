-- Add death_date column to puppies table to track when a puppy died
ALTER TABLE puppies 
ADD COLUMN death_date timestamp with time zone;

-- Add pregnancy_id column to litters table to link litters with pregnancies
ALTER TABLE litters 
ADD COLUMN pregnancy_id uuid REFERENCES pregnancies(id);

-- Create index for faster queries on pregnancy_id
CREATE INDEX idx_litters_pregnancy_id ON litters(pregnancy_id);