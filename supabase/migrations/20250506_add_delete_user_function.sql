
-- Function to allow users to delete their own account
-- This function is primarily a hook that can be called from client
-- The actual deletion is performed by the Edge Function for better error handling
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user's ID
  SELECT auth.uid() INTO user_id;
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Note: The actual deletion is handled by the Edge Function
  -- This function is kept for compatibility and as a hook point
  -- that can be called directly from SQL if needed
  
  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RETURN FALSE;
END;
$$;
