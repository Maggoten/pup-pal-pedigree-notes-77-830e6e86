-- Add source_puppy_id column to dogs table to link dogs created from kept puppies
ALTER TABLE public.dogs 
ADD COLUMN source_puppy_id uuid REFERENCES public.puppies(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_dogs_source_puppy_id ON public.dogs(source_puppy_id);

-- Add comment for documentation
COMMENT ON COLUMN public.dogs.source_puppy_id IS 'Reference to the original puppy if this dog was created from a kept puppy';