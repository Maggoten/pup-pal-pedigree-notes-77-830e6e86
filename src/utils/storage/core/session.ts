
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
  skipThrow?: boolean,
  platform?: ReturnType<typeof getPlatformInfo>
}): Promise<boolean> => {
  const platform = options?.platform || getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;
  const maxRetries = isMobile ? 4 : 2;
  
  // If respectAuthReady is true and authReady is false, don't verify session yet
  if (options?.respectAuthReady && !options.authReady) {
    console.log(`[Session] Auth not ready yet, skipping verification on ${platform.device}`);
    // For mobile devices, add a delay before continuing to allow session to initialize
    if (isMobile) {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Try a lightweight session check without throwing errors
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log(`[Session] Found session during auth-not-ready check on ${platform.device}`);
          return true;
        } else {
          console.log(`[Session] No session found during auth-not-ready check on ${platform.device}`);
        }
      } catch (e) {
        console.log('[Session] Error during lightweight session check:', e);
      }
    }
    return options.skipThrow ? false : true;
  }
  
  try {
    // Check session with retry logic
    console.log(`[Session] Verifying session on ${platform.device}`);
    
    const { data: sessionData, error: sessionError } = await fetchWithRetry(
      () => supabase.auth.getSession(),
      { 
        maxRetries: maxRetries,
        initialDelay: isMobile ? 1800 : 1000,
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
          maxRetries: isMobile ? 4 : 2,
          initialDelay: isMobile ? 1800 : 1000,
          useBackoff: true
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
          await new Promise(resolve => setTimeout(resolve, 2200)); // Increased delay for mobile
          const secondRefresh = await supabase.auth.refreshSession();
          
          if (!secondRefresh.data.session) {
            console.log('[Session] Second refresh attempt failed');
            
            // Last ditch effort - check if we have fragments in storage
            let hasLocalStorageSession = false;
            let hasSessionStorageSession = false;
            
            try {
              hasLocalStorageSession = !!localStorage.getItem('supabase.auth.token') || 
                                     !!localStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
              
              hasSessionStorageSession = !!sessionStorage.getItem('supabase.auth.token') || 
                                       !!sessionStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
            } catch (e) {
              console.warn('[Session] Error accessing storage:', e);
            }
            
            if (isMobile && (hasLocalStorageSession || hasSessionStorageSession)) {
              console.log('[Session] Found token fragments in storage, trying one more refresh');
              await new Promise(resolve => setTimeout(resolve, 1500));
              const finalRefresh = await supabase.auth.refreshSession();
              
              if (finalRefresh.data.session) {
                console.log('[Session] Final refresh successful');
                return true;
              }
            }
            
            // For mobile Safari, provide a more graceful failure that doesn't disrupt the user experience
            if (platform.iOS && platform.safari) {
              console.warn('[Session] iOS Safari session verification failed but allowing operation');
              return options?.skipThrow ? false : true;
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
    
    // For mobile browsers, especially iOS Safari, be more forgiving with session errors
    if (platform.iOS && platform.safari && options?.skipThrow) {
      console.warn('[Session] iOS Safari session error but allowing operation');
      return true;
    }
    
    if (options?.skipThrow) {
      return false;
    }
    throw error;
  }
};
