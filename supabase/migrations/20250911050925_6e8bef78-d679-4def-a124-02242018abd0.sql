-- Create table for puppy weekly photos
CREATE TABLE public.puppy_weekly_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  notes TEXT,
  weight NUMERIC,
  height NUMERIC,
  date_taken TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.puppy_weekly_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access through puppy ownership
CREATE POLICY "Users can view weekly photos for their own puppies"
ON public.puppy_weekly_photos
FOR SELECT
USING (EXISTS (
  SELECT 1
  FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_weekly_photos.puppy_id
  AND l.user_id = auth.uid()
));

CREATE POLICY "Users can create weekly photos for their own puppies"
ON public.puppy_weekly_photos
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1
  FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_weekly_photos.puppy_id
  AND l.user_id = auth.uid()
));

CREATE POLICY "Users can update weekly photos for their own puppies"
ON public.puppy_weekly_photos
FOR UPDATE
USING (EXISTS (
  SELECT 1
  FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_weekly_photos.puppy_id
  AND l.user_id = auth.uid()
));

CREATE POLICY "Users can delete weekly photos for their own puppies"
ON public.puppy_weekly_photos
FOR DELETE
USING (EXISTS (
  SELECT 1
  FROM puppies p
  JOIN litters l ON p.litter_id = l.id
  WHERE p.id = puppy_weekly_photos.puppy_id
  AND l.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE TRIGGER update_puppy_weekly_photos_updated_at
BEFORE UPDATE ON public.puppy_weekly_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_puppy_weekly_photos_puppy_id ON public.puppy_weekly_photos(puppy_id);
CREATE INDEX idx_puppy_weekly_photos_week_number ON public.puppy_weekly_photos(week_number);
CREATE UNIQUE INDEX idx_puppy_weekly_photos_unique ON public.puppy_weekly_photos(puppy_id, week_number);