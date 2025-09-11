-- Create pre_breeding_checklists table
CREATE TABLE public.pre_breeding_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planned_litter_id UUID NOT NULL,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(planned_litter_id, item_id)
);

-- Enable Row Level Security
ALTER TABLE public.pre_breeding_checklists ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own pre-breeding checklists" 
ON public.pre_breeding_checklists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pre-breeding checklists" 
ON public.pre_breeding_checklists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pre-breeding checklists" 
ON public.pre_breeding_checklists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pre-breeding checklists" 
ON public.pre_breeding_checklists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pre_breeding_checklists_updated_at
BEFORE UPDATE ON public.pre_breeding_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();