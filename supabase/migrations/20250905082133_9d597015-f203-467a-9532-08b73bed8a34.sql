-- Add progesterone test columns to heat_logs table
ALTER TABLE public.heat_logs 
ADD COLUMN test_type text DEFAULT 'temperature',
ADD COLUMN progesterone_value numeric;

-- Add comment for clarity
COMMENT ON COLUMN public.heat_logs.test_type IS 'Type of test: temperature or progesterone';
COMMENT ON COLUMN public.heat_logs.progesterone_value IS 'Progesterone value in ng/ml for progesterone tests';