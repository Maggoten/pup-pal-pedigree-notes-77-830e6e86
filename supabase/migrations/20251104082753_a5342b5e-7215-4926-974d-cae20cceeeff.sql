-- Add actual_birth_date column to pregnancies table
ALTER TABLE pregnancies 
ADD COLUMN actual_birth_date timestamp with time zone;

-- Add comment explaining the column
COMMENT ON COLUMN pregnancies.actual_birth_date IS 'Actual date when puppies were born (optional, can be null if pregnancy was interrupted)';