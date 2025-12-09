-- Create pregnancy_weight_logs table for tracking dog weight during pregnancy
CREATE TABLE public.pregnancy_weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pregnancy_id UUID NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  weight NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pregnancy_weight_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own weight logs"
ON public.pregnancy_weight_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
ON public.pregnancy_weight_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
ON public.pregnancy_weight_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
ON public.pregnancy_weight_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_pregnancy_weight_logs_pregnancy_id ON public.pregnancy_weight_logs(pregnancy_id);
CREATE INDEX idx_pregnancy_weight_logs_user_id ON public.pregnancy_weight_logs(user_id);