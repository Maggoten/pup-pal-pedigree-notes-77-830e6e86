
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
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session verification error:", error.message);
      if (!skipThrow) {
        throw new Error(`Authentication required: ${error.message}`);
      }
      return false;
    }
    
    if (!data?.session) {
      console.warn("No active session found");
      if (!skipThrow) {
        throw new Error("Authentication required: No active session");
      }
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Session verification failed:", err);
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
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error) {
      console.error("Failed to refresh session:", error.message);
      throw error;
    }
    
    if (!data?.session) {
      console.error("No session received after refresh");
      throw new Error("Invalid refresh token");
    }
    
    return data.session;
  } catch (err) {
    console.error("Session refresh failed:", err);
    throw err;
  }
}

/**
 * Refreshes the current session
 */
export async function refreshCurrentSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Failed to refresh current session:", error.message);
      throw error;
    }
    
    if (!data?.session) {
      console.error("No session received after refreshing current session");
      throw new Error("No active session to refresh");
    }
    
    return data.session;
  } catch (err) {
    console.error("Current session refresh failed:", err);
    throw err;
  }
}
