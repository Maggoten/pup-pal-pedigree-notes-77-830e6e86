
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { toast } from '@/hooks/use-toast';

// Cache the session validity check to prevent excessive calls
let lastSessionCheck = 0;
let cachedSessionValid = false;
const SESSION_CHECK_INTERVAL = 10000; // 10 seconds
const SESSION_REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutes
const AUTH_ERROR_CODES = ['401', 'JWT', 'auth', 'unauthorized', 'token'];

// Track current session state
interface SessionState {
  lastRefreshed: number;
  refreshInProgress: boolean;
  consecutiveErrors: number;
  lastError?: Error;
  lastRefreshAttempt: number;
}

const state: SessionState = {
  lastRefreshed: 0,
  refreshInProgress: false,
  consecutiveErrors: 0,
  lastRefreshAttempt: 0
};

// Log with timestamp 
const logSessionEvent = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const logFunction = level === 'error' ? console.error : 
                      level === 'warn' ? console.warn : console.log;
  logFunction(`[SessionManager ${timestamp}] ${message}`);
};

/**
 * Verify if the current session is valid with caching to prevent excessive checks
 * @param force Force a fresh check ignoring cache
 * @returns Promise resolving to a boolean indicating if the session is valid
 */
export const verifySession = async (options: {
  force?: boolean;
  respectAuthReady?: boolean;
  authReady?: boolean;
  skipThrow?: boolean;
} = {}): Promise<boolean> => {
  const { force = false, respectAuthReady = false, authReady = true, skipThrow = false } = options;
  const now = Date.now();
  const platform = getPlatformInfo();
  
  // Check if we should respect authReady state
  if (respectAuthReady && !authReady) {
    logSessionEvent('Auth not ready yet, skipping session verification', 'warn');
    return false;
  }
  
  // If not forced and we have a recent check, return cached result
  if (!force && (now - lastSessionCheck) < SESSION_CHECK_INTERVAL) {
    return cachedSessionValid;
  }
  
  try {
    logSessionEvent('Verifying session');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      logSessionEvent(`Session verification error: ${error.message}`, 'error');
      cachedSessionValid = false;
      lastSessionCheck = now;
      
      if (!skipThrow) {
        throw error;
      }
      return false;
    }
    
    const isValid = !!data.session;
    cachedSessionValid = isValid;
    lastSessionCheck = now;
    
    logSessionEvent(`Session valid: ${isValid}`);
    
    // If session is valid, check if it's time for a refresh
    if (isValid && 
        !state.refreshInProgress && 
        (now - state.lastRefreshed) > SESSION_REFRESH_INTERVAL) {
      // Schedule refresh out of band to not block verification
      setTimeout(() => refreshSession(), 0);
    }
    
    return isValid;
  } catch (error) {
    logSessionEvent(`Error during session verification: ${error instanceof Error ? error.message : String(error)}`, 'error');
    cachedSessionValid = false;
    lastSessionCheck = now;
    
    if (!skipThrow) {
      throw error;
    }
    return false;
  }
};

/**
 * Refresh the current session with error tracking to prevent excessive refresh attempts
 */
export const refreshSession = async (): Promise<boolean> => {
  const now = Date.now();
  // Prevent rapid refresh attempts
  const MIN_REFRESH_INTERVAL = 10000; // 10 seconds
  
  // Don't attempt refresh if one is already in progress
  if (state.refreshInProgress) {
    logSessionEvent('Session refresh already in progress, skipping');
    return false;
  }
  
  // Don't refresh too frequently
  if (now - state.lastRefreshAttempt < MIN_REFRESH_INTERVAL) {
    logSessionEvent(`Refresh attempted too soon (${Math.round((now - state.lastRefreshAttempt)/1000)}s ago), skipping`);
    return false;
  }
  
  state.lastRefreshAttempt = now;
  
  // If we have too many consecutive errors, back off
  if (state.consecutiveErrors > 5) {
    const backoffTime = Math.min(30000, 1000 * Math.pow(2, state.consecutiveErrors - 5));
    logSessionEvent(`Too many refresh errors, backing off for ${backoffTime}ms`, 'warn');
    
    // Reset after backoff time
    setTimeout(() => {
      state.consecutiveErrors = 0;
    }, backoffTime);
    
    return false;
  }
  
  state.refreshInProgress = true;
  
  try {
    logSessionEvent('Refreshing session');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      logSessionEvent(`Session refresh error: ${error.message}`, 'error');
      state.consecutiveErrors++;
      state.lastError = error;
      
      // For auth errors, we should notify user if they persist
      if (state.consecutiveErrors >= 3 && 
          AUTH_ERROR_CODES.some(code => error.message.toLowerCase().includes(code.toLowerCase()))) {
        toast({
          title: "Login session expired",
          description: "Please login again to continue.",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return false;
    }
    
    // Reset error count on success and update timestamp
    state.consecutiveErrors = 0;
    state.lastRefreshed = now;
    
    logSessionEvent('Session refreshed successfully');
    return !!data.session;
  } catch (error) {
    logSessionEvent(`Error during session refresh: ${error instanceof Error ? error.message : String(error)}`, 'error');
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
  state.lastRefreshAttempt = 0;
  delete state.lastError;
  
  logSessionEvent('Session state cleared');
};
