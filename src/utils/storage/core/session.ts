
import { supabase } from '@/integrations/supabase/client';

interface VerifySessionOptions {
  respectAuthReady?: boolean;
  authReady?: boolean;
  skipThrow?: boolean;
  mobileOptimized?: boolean;
}

/**
 * Verify if user has a valid session, and refresh it if near expiry
 * Returns a boolean indicating if session is valid
 */
export const verifySession = async (options?: VerifySessionOptions): Promise<boolean> => {
  const { 
    respectAuthReady = false, 
    authReady = false, 
    skipThrow = false,
    mobileOptimized = false
  } = options || {};
  
  // If we respect authReady flag and it's not ready, don't proceed
  if (respectAuthReady && !authReady) {
    console.log('[Session] Auth not ready yet, skipping session verification');
    return false;
  }

  // For mobile, check localStorage for auth timestamp to avoid unnecessary verification
  if (mobileOptimized) {
    try {
      const lastVerified = localStorage.getItem('auth_last_verified');
      if (lastVerified) {
        // If verified in the last 15 seconds, trust it on mobile for better performance
        const lastVerifiedTime = parseInt(lastVerified, 10);
        const now = Date.now();
        if (now - lastVerifiedTime < 15000) { // 15 seconds cache for mobile
          console.log('[Session] Using cached verification result on mobile');
          // Still return true/false based on last known state
          return localStorage.getItem('auth_is_valid') === 'true';
        }
      }
    } catch (e) {
      console.warn('[Session] Error checking cached verification:', e);
    }
  }
  
  try {
    // Get current session to check if it exists and is valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[Session] Error getting session:', sessionError);
      
      // Cache result on mobile
      if (mobileOptimized) {
        try {
          localStorage.setItem('auth_last_verified', Date.now().toString());
          localStorage.setItem('auth_is_valid', 'false');
        } catch (e) {
          console.warn('[Session] Error caching verification result:', e);
        }
      }
      
      if (skipThrow) {
        return false;
      }
      throw sessionError;
    }
    
    // Check if session exists
    if (!sessionData?.session) {
      console.log('[Session] No existing session found');
      
      // Cache result on mobile
      if (mobileOptimized) {
        try {
          localStorage.setItem('auth_last_verified', Date.now().toString());
          localStorage.setItem('auth_is_valid', 'false');
        } catch (e) {
          console.warn('[Session] Error caching verification result:', e);
        }
      }
      
      return false;
    }
    
    // Check if session is about to expire within the next 5 minutes
    const expiresAt = sessionData.session.expires_at;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    
    // Use different thresholds for refresh based on device type
    const refreshThresholdSeconds = mobileOptimized ? 10 * 60 : 5 * 60; // 10 mins mobile, 5 mins desktop
    
    if (expiresAt && expiresAt - now < refreshThresholdSeconds) {
      console.log(`[Session] Session is near expiry (${Math.round((expiresAt - now) / 60)} minutes left), refreshing...`);
      // Refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Session] Error refreshing session:', refreshError);
        
        // Cache negative result
        if (mobileOptimized) {
          try {
            localStorage.setItem('auth_last_verified', Date.now().toString());
            localStorage.setItem('auth_is_valid', 'false');
          } catch (e) {
            console.warn('[Session] Error caching verification result:', e);
          }
        }
        
        if (skipThrow) {
          return false;
        }
        throw refreshError;
      }
      
      const isValid = !!refreshData.session;
      
      // Cache positive result
      if (mobileOptimized) {
        try {
          localStorage.setItem('auth_last_verified', Date.now().toString());
          localStorage.setItem('auth_is_valid', isValid ? 'true' : 'false');
        } catch (e) {
          console.warn('[Session] Error caching verification result:', e);
        }
      }
      
      return isValid;
    }
    
    console.log('[Session] Session verified and valid');
    
    // Cache positive result
    if (mobileOptimized) {
      try {
        localStorage.setItem('auth_last_verified', Date.now().toString());
        localStorage.setItem('auth_is_valid', 'true');
      } catch (e) {
        console.warn('[Session] Error caching verification result:', e);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('[Session] Verification error:', error);
    
    // Cache negative result on error for mobile
    if (mobileOptimized) {
      try {
        localStorage.setItem('auth_last_verified', Date.now().toString());
        localStorage.setItem('auth_is_valid', 'false');
      } catch (e) {
        console.warn('[Session] Error caching verification result:', e);
      }
    }
    
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

/**
 * Session heartbeat function to detect silent session drops
 */
export const sessionHeartbeat = async (): Promise<{ isValid: boolean; needsRefresh: boolean; }> => {
  try {
    // Try to get current session
    const { data } = await supabase.auth.getSession();
    const hasMemorySession = !!data.session;
    
    if (!hasMemorySession) {
      // Try to detect if we should have a session
      const hasStoredSession = await validateCrossStorageSession();
      
      if (hasStoredSession) {
        // We found storage evidence of a session, but no active session in memory
        // This indicates we need a refresh
        console.log('[Session] Heartbeat detected fragmented session state, attempting recovery');
        const { data: refreshData } = await supabase.auth.refreshSession();
        return { 
          isValid: !!refreshData.session, 
          needsRefresh: true 
        };
      }
      
      // No session evidence found
      return { 
        isValid: false, 
        needsRefresh: false 
      };
    }
    
    // Check if session is about to expire
    if (data.session.expires_at) {
      const expiresAt = data.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = expiresAt - now;
      
      // If less than 15 minutes left, mark for refresh
      if (timeLeft < 15 * 60) {
        return {
          isValid: true,
          needsRefresh: true
        };
      }
    }
    
    // Valid session with plenty of time left
    return {
      isValid: true,
      needsRefresh: false
    };
    
  } catch (e) {
    console.error('[Session] Error during heartbeat check:', e);
    return {
      isValid: false,
      needsRefresh: true
    };
  }
};
