
import { supabase } from '@/integrations/supabase/client';

interface VerifySessionOptions {
  respectAuthReady?: boolean;
  authReady?: boolean;
  skipThrow?: boolean;
}

/**
 * Verify if user has a valid session, and refresh it if near expiry
 * Returns a boolean indicating if session is valid
 */
export const verifySession = async (options?: VerifySessionOptions): Promise<boolean> => {
  const { respectAuthReady = false, authReady = false, skipThrow = false } = options || {};
  
  // If we respect authReady flag and it's not ready, don't proceed
  if (respectAuthReady && !authReady) {
    console.log('[Session] Auth not ready yet, skipping session verification');
    return false;
  }
  
  try {
    // Get current session to check if it exists and is valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Session] Error getting session:', sessionError);
      throw sessionError;
    }
    
    // Check if session exists
    if (!sessionData?.session) {
      console.log('[Session] No existing session found');
      return false;
    }
    
    // Check if session is about to expire within the next 5 minutes
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const fiveMinutesInSeconds = 5 * 60;
    
    if (expiresAt && expiresAt - now < fiveMinutesInSeconds) {
      console.log('[Session] Session is near expiry, refreshing...');
      // Refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Session] Error refreshing session:', refreshError);
        
        if (skipThrow) {
          return false;
        }
        throw refreshError;
      }
      
      return !!refreshData.session;
    }
    
    console.log('[Session] Session verified and valid');
    return true;
    
  } catch (error) {
    console.error('[Session] Verification error:', error);
    
    if (skipThrow) {
      return false;
    }
    throw error;
  }
};

/**
 * A more thorough cross-storage session verification that works better for mobile
 */
export const validateCrossStorageSession = async (): Promise<boolean> => {
  try {
    let hasLocalStorageSession = false;
    let hasSessionStorageSession = false;
    
    // Check localStorage for session fragments
    try {
      const localStorageToken = localStorage.getItem('supabase.auth.token') ||
                               localStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
      hasLocalStorageSession = !!localStorageToken;
      if (hasLocalStorageSession) {
        console.log('[Session] Found session token in localStorage');
      }
    } catch (e) {
      console.warn('[Session] Error checking localStorage:', e);
    }
    
    // Check sessionStorage for session fragments
    try {
      const sessionStorageToken = sessionStorage.getItem('supabase.auth.token') ||
                                  sessionStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
      hasSessionStorageSession = !!sessionStorageToken;
      if (hasSessionStorageSession) {
        console.log('[Session] Found session token in sessionStorage');
      }
    } catch (e) {
      console.warn('[Session] Error checking sessionStorage:', e);
    }
    
    // Get current session from Supabase
    const { data } = await supabase.auth.getSession();
    const hasMemorySession = !!data.session;
    
    // If we found a session in storage but not in memory, try to recover
    if ((hasLocalStorageSession || hasSessionStorageSession) && !hasMemorySession) {
      console.log('[Session] Storage fragmentation detected: session in storage but not in memory');
      
      // Force a refresh to try to recover
      const { data: refreshData } = await supabase.auth.refreshSession();
      return !!refreshData.session;
    }
    
    return hasMemorySession;
  } catch (e) {
    console.error('[Session] Error during cross-storage validation:', e);
    return false;
  }
};
