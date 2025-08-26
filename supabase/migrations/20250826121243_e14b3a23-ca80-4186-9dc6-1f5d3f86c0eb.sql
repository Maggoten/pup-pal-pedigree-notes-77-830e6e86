-- Create heat_cycles table for tracking individual heat cycles
CREATE TABLE public.heat_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  user_id UUID NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  cycle_length INTEGER, -- calculated when cycle ends
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create heat_logs table for detailed daily observations
CREATE TABLE public.heat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  heat_cycle_id UUID NOT NULL REFERENCES public.heat_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  phase TEXT CHECK (phase IN ('proestrus', 'estrus', 'diestrus', 'anestrus')),
  observations TEXT,
  temperature NUMERIC(4,1), -- e.g., 38.5°C
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.heat_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heat_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for heat_cycles
CREATE POLICY "Users can view their own heat cycles" 
ON public.heat_cycles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own heat cycles" 
ON public.heat_cycles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own heat cycles" 
ON public.heat_cycles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own heat cycles" 
ON public.heat_cycles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for heat_logs
CREATE POLICY "Users can view their own heat logs" 
ON public.heat_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own heat logs" 
ON public.heat_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own heat logs" 
ON public.heat_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own heat logs" 
ON public.heat_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_heat_cycles_updated_at
BEFORE UPDATE ON public.heat_cycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_heat_logs_updated_at
BEFORE UPDATE ON public.heat_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_heat_cycles_dog_id ON public.heat_cycles(dog_id);
CREATE INDEX idx_heat_cycles_user_id ON public.heat_cycles(user_id);
CREATE INDEX idx_heat_cycles_start_date ON public.heat_cycles(start_date);

CREATE INDEX idx_heat_logs_heat_cycle_id ON public.heat_logs(heat_cycle_id);
CREATE INDEX idx_heat_logs_user_id ON public.heat_logs(user_id);
CREATE INDEX idx_heat_logs_date ON public.heat_logs(date);

-- Add unique constraint to prevent duplicate dates within same heat cycle
CREATE UNIQUE INDEX idx_heat_logs_unique_date_per_cycle 
ON public.heat_logs(heat_cycle_id, date);