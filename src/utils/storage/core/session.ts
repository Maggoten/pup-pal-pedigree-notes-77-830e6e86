
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
  // Increased max retries to help mobile sessions
  const maxRetries = isMobile ? 5 : 2;
  
  // If respectAuthReady is true and authReady is false, don't verify session yet
  if (options?.respectAuthReady && !options.authReady) {
    console.log(`[Session] Auth not ready yet, skipping verification on ${platform.device}`);
    // For mobile devices, add a delay before continuing to allow session to initialize
    if (isMobile) {
      // Increased delay from 1800ms to 2500ms
      await new Promise(resolve => setTimeout(resolve, 2500));
      
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
    // For iOS, we'll allow operations even without valid session to avoid disrupting uploads
    if (platform.iOS) {
      console.log('[Session] iOS device detected, allowing operation despite auth not ready');
      return true;
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
        // Increased initial delay for mobile
        initialDelay: isMobile ? 2200 : 1000,
        useBackoff: true
      }
    );
    
    if (sessionError) {
      console.error('[Session] Error during verification:', sessionError);
      // For mobile, especially iOS, we avoid throwing errors
      if (isMobile && options?.skipThrow) {
        console.log('[Session] Mobile device detected, continuing despite session error');
        return true;
      }
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
          // Increased retries for mobile
          maxRetries: isMobile ? 5 : 2,
          // Increased initial delay for mobile
          initialDelay: isMobile ? 2200 : 1000,
          useBackoff: true
        }
      );
      
      const refreshError = refreshResult.error;
      const refreshData = refreshResult.data;
      
      if (refreshError) {
        console.error('[Session] Refresh error:', refreshError);
        // For mobile, especially iOS, be more forgiving
        if (isMobile && options?.skipThrow) {
          console.log('[Session] Mobile detected, continuing despite refresh error');
          return true;
        }
        if (options?.skipThrow) {
          return false;
        }
        throw new Error(`Session refresh failed: ${refreshError.message}`);
      }
      
      if (!refreshData.session) {
        if (platform.safari || platform.mobile) {
          // Special handling for mobile browsers which have more session issues
          console.log(`[Session] ${platform.device} detected, making extra refresh attempt`);
          // Increased delay for mobile
          await new Promise(resolve => setTimeout(resolve, 2800));
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
              // Increased delay for mobile
              await new Promise(resolve => setTimeout(resolve, 2000));
              const finalRefresh = await supabase.auth.refreshSession();
              
              if (finalRefresh.data.session) {
                console.log('[Session] Final refresh successful');
                return true;
              }
            }
            
            // For mobile Safari, provide a more graceful failure that doesn't disrupt the user experience
            if (platform.iOS && platform.safari) {
              console.warn('[Session] iOS Safari session verification failed but allowing operation');
              return true;
            }
            
            if (platform.mobile && options?.skipThrow) {
              console.warn('[Session] Mobile session verification failed but allowing operation');
              return true;
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
    if ((platform.iOS || platform.mobile) && options?.skipThrow) {
      console.warn(`[Session] ${platform.device} session error but allowing operation`);
      return true;
    }
    
    if (options?.skipThrow) {
      return false;
    }
    throw error;
  }
};
