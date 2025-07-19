-- Create partner_offers table for marketing content
CREATE TABLE public.partner_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partner_offers ENABLE ROW LEVEL SECURITY;

-- Create policies - public read for active offers, admin-only write
CREATE POLICY "Anyone can view active partner offers" 
ON public.partner_offers 
FOR SELECT 
USING (active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partner_offers_updated_at
BEFORE UPDATE ON public.partner_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();