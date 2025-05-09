
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_ERRORS } from '../config';
import { getPlatformInfo } from '../mobileUpload';
import { fetchWithRetry } from '@/utils/fetchUtils';

/**
 * Verifies and refreshes authentication session if needed
 * @param options Optional configuration for verification
 * @returns true if session is valid, throws error if not
 */
export const verifySession = async (options?: { 
  respectAuthReady?: boolean, 
  authReady?: boolean,
  skipThrow?: boolean
}): Promise<boolean> => {
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;
  const maxRetries = isMobile ? 3 : 1;
  
  // If authReady flag is respected and it's false, add delay for mobile
  if (options?.respectAuthReady && !options.authReady && isMobile) {
    console.log(`[Session] Auth not ready yet, delaying verification on ${platform.device}`);
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  try {
    // Check session with retry logic
    console.log(`[Session] Verifying session on ${platform.device}`);
    
    const { data: sessionData, error: sessionError } = await fetchWithRetry(
      () => supabase.auth.getSession(),
      { 
        maxRetries: maxRetries,
        initialDelay: isMobile ? 1200 : 800,
        useBackoff: true
      }
    );
    
    if (sessionError) {
      console.error('[Session] Error during verification:', sessionError);
      if (options?.skipThrow) {
        return false;
      }
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    if (!sessionData.session) {
      // Try to refresh session
      console.log('[Session] No active session, attempting to refresh');
      const refreshResult = await fetchWithRetry(
        () => supabase.auth.refreshSession(),
        { 
          maxRetries: isMobile ? 2 : 1,
          initialDelay: isMobile ? 1200 : 800
        }
      );
      
      const refreshError = refreshResult.error;
      const refreshData = refreshResult.data;
      
      if (refreshError) {
        console.error('[Session] Refresh error:', refreshError);
        if (options?.skipThrow) {
          return false;
        }
        throw new Error(`Session refresh failed: ${refreshError.message}`);
      }
      
      if (!refreshData.session) {
        if (platform.safari || platform.mobile) {
          // Special handling for mobile browsers which have more session issues
          console.log(`[Session] ${platform.device} detected, making extra refresh attempt`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay
          const secondRefresh = await supabase.auth.refreshSession();
          
          if (!secondRefresh.data.session) {
            console.log('[Session] Second refresh attempt failed');
            
            // Last ditch effort - check if we have fragments in storage
            const hasLocalStorageSession = localStorage.getItem('supabase.auth.token') || 
                                         localStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
            
            if (isMobile && hasLocalStorageSession) {
              console.log('[Session] Found token fragments in storage, trying one more refresh');
              await new Promise(resolve => setTimeout(resolve, 800));
              const finalRefresh = await supabase.auth.refreshSession();
              
              if (finalRefresh.data.session) {
                console.log('[Session] Final refresh successful');
                return true;
              }
            }
            
            if (options?.skipThrow) {
              return false;
            }
            throw new Error(STORAGE_ERRORS.NO_SESSION);
          }
          return true;
        } else {
          if (options?.skipThrow) {
            return false;
          }
          throw new Error(STORAGE_ERRORS.NO_SESSION);
        }
      }
    }
    
    console.log('[Session] Active session confirmed for user:', sessionData.session?.user.id);
    return true;
  } catch (error) {
    console.error('[Session] Verification failed:', error);
    if (options?.skipThrow) {
      return false;
    }
    throw error;
  }
};

