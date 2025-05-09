
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

/**
 * Hook for handling Supabase authentication session validation and refresh
 */
export const useImageSessionCheck = () => {
  /**
   * Validates the current authentication session and attempts to refresh if needed
   * Has special handling for mobile devices and Safari which have more session issues
   */
  const validateSession = async (): Promise<boolean> => {
    const platform = getPlatformInfo();
    
    // First check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error: ' + sessionError.message);
    }
    
    if (!sessionData.session) {
      // Try to refresh session
      console.log('No active session, attempting to refresh');
      const refreshResult = await supabase.auth.refreshSession();
      const refreshError = refreshResult.error;
      const refreshData = refreshResult.data;
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        throw new Error('Session refresh failed: ' + refreshError.message);
      }
      
      if (!refreshData.session) {
        if (platform.safari || platform.mobile) {
          // Special handling for mobile browsers which have more session issues
          console.log(`${platform.device} detected, making extra refresh attempt`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          const secondRefresh = await supabase.auth.refreshSession();
          if (!secondRefresh.data.session) {
            throw new Error('No active session after multiple refresh attempts. Please login again.');
          }
          return true;
        } else {
          throw new Error('No active session. User authentication is required for uploads.');
        }
      }
    }
    
    console.log('Active session confirmed for user:', sessionData.session?.user.id);
    return true;
  };

  return { validateSession };
};
