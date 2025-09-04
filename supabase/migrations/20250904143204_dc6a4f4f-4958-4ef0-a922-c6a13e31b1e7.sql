-- Add language column to profiles table for multilingual email support
ALTER TABLE public.profiles 
ADD COLUMN language text DEFAULT 'sv' CHECK (language IN ('sv', 'en'));