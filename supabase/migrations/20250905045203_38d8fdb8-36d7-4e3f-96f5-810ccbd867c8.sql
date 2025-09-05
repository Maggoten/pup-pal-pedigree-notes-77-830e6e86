-- Add newsletter consent column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN newsletter_consent boolean DEFAULT false;

-- Update the handle_new_user trigger function to include newsletter consent
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, address, subscription_status, has_paid, friend, newsletter_consent)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    NEW.raw_user_meta_data->>'address',
    'inactive',
    false,
    false,
    COALESCE((NEW.raw_user_meta_data->>'newsletter_consent')::boolean, false)
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;