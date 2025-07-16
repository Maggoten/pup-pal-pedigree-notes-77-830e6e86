-- Add sterilization_date field to dogs table
ALTER TABLE public.dogs 
ADD COLUMN sterilization_date date;