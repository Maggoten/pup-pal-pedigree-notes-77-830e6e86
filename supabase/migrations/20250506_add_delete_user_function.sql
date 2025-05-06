
-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result RECORD;
  user_id UUID;
BEGIN
  -- Get the current user's ID
  SELECT auth.uid() INTO user_id;
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- First delete the user's profile
  DELETE FROM public.profiles WHERE id = user_id;
  
  -- The actual user deletion from auth.users would need to be handled
  -- by the Supabase admin API, which we can't call directly from SQL.
  -- This function mainly serves as a hook that can be called from the client.
  
  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RETURN FALSE;
END;
$$;
