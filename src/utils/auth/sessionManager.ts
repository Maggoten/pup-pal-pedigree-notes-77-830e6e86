
import { supabase } from "@/integrations/supabase/client";

interface VerifySessionOptions {
  skipThrow?: boolean;
}

/**
 * Verifies if there is an active session
 * @param options Configuration options for session verification
 * @returns true if the session is valid, false otherwise
 * @throws Error if session is invalid and skipThrow is false
 */
export async function verifySession(options: VerifySessionOptions = {}): Promise<boolean> {
  try {
    const { skipThrow = false } = options;
    console.log('[SessionManager] verifySession called with skipThrow:', skipThrow);
    
    const { data, error } = await supabase.auth.getSession();
    console.log('[SessionManager] getSession result:', { 
      hasSession: !!data?.session, 
      hasError: !!error,
      errorMessage: error ? error.message : 'none'
    });
    
    if (error) {
      console.error("[SessionManager] Session verification error:", error.message);
      if (!skipThrow) {
        throw new Error(`Authentication required: ${error.message}`);
      }
      return false;
    }
    
    if (!data?.session) {
      console.warn("[SessionManager] No active session found");
      if (!skipThrow) {
        throw new Error("Authentication required: No active session");
      }
      return false;
    }
    
    console.log('[SessionManager] Valid session found, expires at:', 
      new Date(data.session.expires_at! * 1000).toISOString());
    return true;
  } catch (err) {
    console.error("[SessionManager] Session verification failed:", err);
    if (!options.skipThrow) {
      throw err;
    }
    return false;
  }
}

/**
 * Creates a new session from a refresh token
 * @param refreshToken The refresh token to use
 */
export async function refreshSessionFromToken(refreshToken: string) {
  try {
    console.log('[SessionManager] Attempting to refresh session using refresh token');
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error) {
      console.error("[SessionManager] Failed to refresh session:", error.message);
      throw error;
    }
    
    if (!data?.session) {
      console.error("[SessionManager] No session received after refresh");
      throw new Error("Invalid refresh token");
    }
    
    console.log('[SessionManager] Session successfully refreshed, expires at:', 
      new Date(data.session.expires_at! * 1000).toISOString());
    return data.session;
  } catch (err) {
    console.error("[SessionManager] Session refresh failed:", err);
    throw err;
  }
}

/**
 * Refreshes the current session
 */
export async function refreshCurrentSession() {
  try {
    console.log('[SessionManager] Attempting to refresh current session');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("[SessionManager] Failed to refresh current session:", error.message);
      throw error;
    }
    
    if (!data?.session) {
      console.error("[SessionManager] No session received after refreshing current session");
      throw new Error("No active session to refresh");
    }
    
    console.log('[SessionManager] Current session successfully refreshed, expires at:', 
      new Date(data.session.expires_at! * 1000).toISOString());
    return data.session;
  } catch (err) {
    console.error("[SessionManager] Current session refresh failed:", err);
    throw err;
  }
}

/**
 * Refreshes the session and returns if it was successful
 */
export async function refreshSession(): Promise<boolean> {
  try {
    console.log('[SessionManager] refreshSession called');
    await refreshCurrentSession();
    return true;
  } catch (err) {
    console.error("[SessionManager] Failed to refresh session:", err);
    return false;
  }
}

/**
 * Clears any session state that may be stored in memory
 */
export function clearSessionState() {
  console.log('[Auth] Clearing session state');
  // Clean up any stored session data if needed
  // For example, clear local variables, cookies, etc.
  // Currently just a placeholder for session cleanup logic
}
