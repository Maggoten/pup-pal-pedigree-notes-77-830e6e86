-- Add new columns to dogs table for health tracking
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS rabies_date date;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS health_tests jsonb DEFAULT '[]'::jsonb;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS health_notes text;

-- Create dog weight logs table
CREATE TABLE IF NOT EXISTS dog_weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  weight numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create dog height logs table
CREATE TABLE IF NOT EXISTS dog_height_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  height numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE dog_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_height_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for dog_weight_logs
CREATE POLICY "Users can view their own dog weight logs"
  ON dog_weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dog weight logs"
  ON dog_weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dog weight logs"
  ON dog_weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dog weight logs"
  ON dog_weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for dog_height_logs
CREATE POLICY "Users can view their own dog height logs"
  ON dog_height_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dog height logs"
  ON dog_height_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dog height logs"
  ON dog_height_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dog height logs"
  ON dog_height_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dog_weight_logs_dog_id ON dog_weight_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_weight_logs_user_id ON dog_weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_dog_height_logs_dog_id ON dog_height_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_height_logs_user_id ON dog_height_logs(user_id);