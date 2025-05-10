
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

// Cache the session validity check to prevent excessive calls
let lastSessionCheck = 0;
let cachedSessionValid = false;
const SESSION_CHECK_INTERVAL = 10000; // 10 seconds
const SESSION_REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutes

// Track current session state
interface SessionState {
  lastRefreshed: number;
  refreshInProgress: boolean;
  consecutiveErrors: number;
  lastError?: Error;
}

const state: SessionState = {
  lastRefreshed: 0,
  refreshInProgress: false,
  consecutiveErrors: 0
};

/**
 * Verify if the current session is valid with caching to prevent excessive checks
 * @param force Force a fresh check ignoring cache
 * @returns Promise resolving to a boolean indicating if the session is valid
 */
export const verifySession = async (force = false): Promise<boolean> => {
  const now = Date.now();
  const platform = getPlatformInfo();
  
  // If not forced and we have a recent check, return cached result
  if (!force && (now - lastSessionCheck) < SESSION_CHECK_INTERVAL) {
    return cachedSessionValid;
  }
  
  try {
    console.log('[SessionManager] Verifying session');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[SessionManager] Session verification error:', error);
      cachedSessionValid = false;
      lastSessionCheck = now;
      return false;
    }
    
    const isValid = !!data.session;
    cachedSessionValid = isValid;
    lastSessionCheck = now;
    
    console.log(`[SessionManager] Session valid: ${isValid}`);
    
    // If session is valid, check if it's time for a refresh
    if (isValid && 
        !state.refreshInProgress && 
        (now - state.lastRefreshed) > SESSION_REFRESH_INTERVAL) {
      // Schedule refresh out of band to not block verification
      setTimeout(() => refreshSession(), 0);
    }
    
    return isValid;
  } catch (error) {
    console.error('[SessionManager] Error during session verification:', error);
    cachedSessionValid = false;
    lastSessionCheck = now;
    return false;
  }
};

/**
 * Refresh the current session with error tracking to prevent excessive refresh attempts
 */
export const refreshSession = async (): Promise<boolean> => {
  // Don't attempt refresh if one is already in progress
  if (state.refreshInProgress) {
    console.log('[SessionManager] Session refresh already in progress, skipping');
    return false;
  }
  
  // If we have too many consecutive errors, back off
  if (state.consecutiveErrors > 5) {
    const backoffTime = Math.min(30000, 1000 * Math.pow(2, state.consecutiveErrors - 5));
    console.log(`[SessionManager] Too many refresh errors, backing off for ${backoffTime}ms`);
    
    // Reset after backoff time
    setTimeout(() => {
      state.consecutiveErrors = 0;
    }, backoffTime);
    
    return false;
  }
  
  state.refreshInProgress = true;
  
  try {
    console.log('[SessionManager] Refreshing session');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('[SessionManager] Session refresh error:', error);
      state.consecutiveErrors++;
      state.lastError = error;
      return false;
    }
    
    // Reset error count on success and update timestamp
    state.consecutiveErrors = 0;
    state.lastRefreshed = Date.now();
    
    console.log('[SessionManager] Session refreshed successfully');
    return !!data.session;
  } catch (error) {
    console.error('[SessionManager] Error during session refresh:', error instanceof Error ? error : String(error));
    state.consecutiveErrors++;
    state.lastError = error instanceof Error ? error : new Error(String(error));
    return false;
  } finally {
    state.refreshInProgress = false;
  }
};

/**
 * Clear any session state and reset all cached values
 */
export const clearSessionState = () => {
  lastSessionCheck = 0;
  cachedSessionValid = false;
  state.lastRefreshed = 0;
  state.refreshInProgress = false;
  state.consecutiveErrors = 0;
  delete state.lastError;
  
  console.log('[SessionManager] Session state cleared');
};
