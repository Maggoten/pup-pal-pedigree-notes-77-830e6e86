
import { supabase } from '@/integrations/supabase/client';
import { isMobileDevice } from '@/utils/fetchUtils';

interface VerifySessionOptions {
  respectAuthReady?: boolean;
  authReady?: boolean;
  skipThrow?: boolean;
  mobileOptimization?: boolean;
}

// Mobile-specific cache to store session state
const mobileSessionCache = {
  lastVerified: 0,
  isValid: false,
  userId: '',
  setValid: (userId: string) => {
    mobileSessionCache.lastVerified = Date.now();
    mobileSessionCache.isValid = true;
    mobileSessionCache.userId = userId;
    try {
      // Persist in localStorage for offline access
      localStorage.setItem('mobile_session_cache', JSON.stringify({
        lastVerified: mobileSessionCache.lastVerified,
        isValid: true,
        userId
      }));
    } catch (e) {
      console.warn('[Mobile Session] Failed to cache session state:', e);
    }
  },
  getValid: () => {
    // Use cached value if less than threshold (30 seconds on mobile)
    const threshold = isMobileDevice() ? 30000 : 5000;
    if (Date.now() - mobileSessionCache.lastVerified < threshold) {
      return {
        isValid: mobileSessionCache.isValid,
        userId: mobileSessionCache.userId
      };
    }
    
    // Try to load from localStorage if available
    try {
      const cached = localStorage.getItem('mobile_session_cache');
      if (cached) {
        const data = JSON.parse(cached);
        // Only use cached data if it's not too old (5 minutes on mobile)
        if (Date.now() - data.lastVerified < 300000) {
          mobileSessionCache.lastVerified = data.lastVerified;
          mobileSessionCache.isValid = data.isValid;
          mobileSessionCache.userId = data.userId;
          return {
            isValid: data.isValid,
            userId: data.userId
          };
        }
      }
    } catch (e) {
      console.warn('[Mobile Session] Failed to load cached session:', e);
    }
    
    return {
      isValid: false,
      userId: ''
    };
  },
  invalidate: () => {
    mobileSessionCache.lastVerified = 0;
    mobileSessionCache.isValid = false;
    mobileSessionCache.userId = '';
    try {
      localStorage.removeItem('mobile_session_cache');
    } catch (e) {
      // Ignore error
    }
  }
};

/**
 * Verify if user has a valid session, and refresh it if near expiry
 * Returns a boolean indicating if session is valid
 */
export const verifySession = async (options?: VerifySessionOptions): Promise<boolean> => {
  const { 
    respectAuthReady = false, 
    authReady = false, 
    skipThrow = false,
    mobileOptimization = true
  } = options || {};
  
  const isMobile = isMobileDevice();
  
  // On mobile, check the cache first to avoid unnecessary API calls
  if (isMobile && mobileOptimization) {
    const cached = mobileSessionCache.getValid();
    if (cached.isValid && cached.userId) {
      console.log('[Session] Using cached valid session status for mobile');
      return true;
    }
  }
  
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
      mobileSessionCache.invalidate();
      return false;
    }
    
    // Update mobile cache on successful verification
    if (isMobile && sessionData.session?.user?.id) {
      mobileSessionCache.setValid(sessionData.session.user.id);
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
        
        // For mobile, attempt offline recovery
        if (isMobile && mobileOptimization) {
          const cached = mobileSessionCache.getValid();
          if (cached.isValid && cached.userId) {
            console.log('[Session] Offline recovery activated for mobile');
            return true;
          }
        }
        
        if (skipThrow) {
          return false;
        }
        throw refreshError;
      }
      
      // Update mobile cache if refresh was successful
      if (isMobile && refreshData.session?.user?.id) {
        mobileSessionCache.setValid(refreshData.session.user.id);
      }
      
      return !!refreshData.session;
    }
    
    console.log('[Session] Session verified and valid');
    return true;
    
  } catch (error) {
    console.error('[Session] Verification error:', error);
    
    // For mobile, attempt offline recovery as a last resort
    if (isMobile && mobileOptimization) {
      const cached = mobileSessionCache.getValid();
      if (cached.isValid && cached.userId) {
        console.log('[Session] Offline error recovery activated for mobile');
        return true;
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
    
    // Check mobile cache as an additional source
    const mobileCached = mobileSessionCache.getValid();
    const hasMobileCache = mobileCached.isValid && !!mobileCached.userId;
    
    if (hasMobileCache) {
      console.log('[Session] Found valid mobile session cache');
    }
    
    // Get current session from Supabase
    const { data } = await supabase.auth.getSession();
    const hasMemorySession = !!data.session;
    
    // If we found a session in storage but not in memory, try to recover
    if ((hasLocalStorageSession || hasSessionStorageSession || hasMobileCache) && !hasMemorySession) {
      console.log('[Session] Storage fragmentation detected: session in storage but not in memory');
      
      // Force a refresh to try to recover
      const { data: refreshData } = await supabase.auth.refreshSession();
      
      // Update cache if successful
      if (refreshData.session?.user?.id) {
        mobileSessionCache.setValid(refreshData.session.user.id);
      }
      
      return !!refreshData.session;
    }
    
    // If we have a memory session, update the cache
    if (hasMemorySession && data.session?.user?.id) {
      mobileSessionCache.setValid(data.session.user.id);
    }
    
    return hasMemorySession || hasMobileCache;
  } catch (e) {
    console.error('[Session] Error during cross-storage validation:', e);
    
    // Last resort - check mobile cache
    const mobileCached = mobileSessionCache.getValid();
    return mobileCached.isValid && !!mobileCached.userId;
  }
};

/**
 * Preload session data on mobile to reduce initial load time
 * This is called during app initialization
 */
export const preloadSessionData = async (): Promise<void> => {
  if (!isMobileDevice()) return;
  
  try {
    // Try to load session cache from localStorage
    const cached = localStorage.getItem('mobile_session_cache');
    if (cached) {
      const data = JSON.parse(cached);
      if (data && data.isValid && data.userId && Date.now() - data.lastVerified < 300000) {
        console.log('[Session] Preloaded mobile session cache');
        mobileSessionCache.lastVerified = data.lastVerified;
        mobileSessionCache.isValid = data.isValid;
        mobileSessionCache.userId = data.userId;
      }
    }
  } catch (e) {
    console.warn('[Session] Failed to preload mobile session cache:', e);
  }
};
