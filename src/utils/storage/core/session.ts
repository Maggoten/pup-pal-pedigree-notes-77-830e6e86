
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_ERRORS } from '../config';
import { getPlatformInfo } from '../mobileUpload';

/**
 * Verifies and refreshes authentication session if needed
 * @returns true if session is valid, throws error if not
 */
export const verifySession = async (): Promise<boolean> => {
  const platform = getPlatformInfo();
  
  // First check session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error during storage operation:', sessionError);
    throw new Error(`Authentication error: ${sessionError.message}`);
  }
  
  if (!sessionData.session) {
    // Try to refresh session
    console.log('No active session, attempting to refresh');
    const refreshResult = await supabase.auth.refreshSession();
    const refreshError = refreshResult.error;
    const refreshData = refreshResult.data;
    
    if (refreshError) {
      console.error('Session refresh error:', refreshError);
      throw new Error(`Session refresh failed: ${refreshError.message}`);
    }
    
    if (!refreshData.session) {
      if (platform.safari || platform.mobile) {
        // Special handling for mobile browsers which have more session issues
        console.log(`${platform.device} detected, making extra refresh attempt`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const secondRefresh = await supabase.auth.refreshSession();
        if (!secondRefresh.data.session) {
          throw new Error(STORAGE_ERRORS.NO_SESSION);
        }
        return true;
      } else {
        throw new Error(STORAGE_ERRORS.NO_SESSION);
      }
    }
  }
  
  console.log('Active session confirmed for user:', sessionData.session?.user.id);
  return true;
};
