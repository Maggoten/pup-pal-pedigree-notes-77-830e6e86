
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_ERRORS } from '../config';

interface VerifyOptions {
  skipThrow?: boolean;
}

/**
 * Verify that a valid storage session exists
 */
export const verifyStorageSession = async (options: VerifyOptions = {}): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session verification error:', error);
      
      if (!options.skipThrow) {
        throw new Error(STORAGE_ERRORS.NO_SESSION);
      }
      
      return false;
    }
    
    if (!data.session) {
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh failed:', refreshError || 'No session after refresh');
        
        if (!options.skipThrow) {
          throw new Error(STORAGE_ERRORS.NO_SESSION);
        }
        
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying session:', error);
    
    if (!options.skipThrow) {
      throw error;
    }
    
    return false;
  }
};
