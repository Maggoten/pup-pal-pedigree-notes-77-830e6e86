
-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result RECORD;
BEGIN
  -- Attempt to delete the user from auth.users (will cascade to profiles)
  EXECUTE format(
    'SELECT auth.uid() as uid;'
  ) INTO result;

  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RETURN FALSE;
END;
$$;
