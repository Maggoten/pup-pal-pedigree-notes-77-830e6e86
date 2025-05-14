
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Verifies if there's a valid Supabase session for storage operations
 */
export async function verifyStorageSession(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Storage Session] Session verification error:', error);
      return null;
    }
    
    if (!session) {
      console.warn('[Storage Session] No active session found');
      return null;
    }
    
    return session.user.id;
  } catch (error) {
    console.error('[Storage Session] Unexpected error checking session:', error);
    return null;
  }
}

/**
 * Checks if the user has access to storage
 * and shows appropriate feedback if not
 */
export async function checkStorageAccess(): Promise<boolean> {
  const userId = await verifyStorageSession();
  
  if (!userId) {
    toast({
      title: 'Authentication Required',
      description: 'Please log in to upload files',
      variant: 'destructive'
    });
    return false;
  }
  
  return true;
}
