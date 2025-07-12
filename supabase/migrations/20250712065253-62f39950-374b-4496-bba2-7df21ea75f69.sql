-- Remove the delete_old_heat_entries function as it's no longer needed
-- Heat history records should be permanent breeding records
DROP FUNCTION IF EXISTS public.delete_old_heat_entries();