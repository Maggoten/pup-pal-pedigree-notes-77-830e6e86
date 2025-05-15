
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_ERROR_CODES } from '../config';

interface VerifySessionOptions {
  skipThrow?: boolean;
  authReady?: boolean;
  mobileOptimized?: boolean;
}

/**
 * Verify that a valid session exists
 * @param options Options for verification
 * @returns True if session exists, false otherwise
 * @throws Error if no session exists (unless skipThrow is true)
 */
export const verifySession = async (options: VerifySessionOptions = {}): Promise<boolean> => {
  try {
    // If we need to respect auth ready state, wait for it
    if (options.authReady === false) {
      console.log('Auth not ready yet, delaying session verification');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session verification error:', sessionError);
      if (!options.skipThrow) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      return false;
    }
    
    if (!sessionData.session) {
      console.error('No active session found during verification');
      if (!options.skipThrow) {
        throw new Error(STORAGE_ERROR_CODES.NO_SESSION);
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying session:', error);
    if (!options.skipThrow) {
      throw error;
    }
    return false;
  }
};

// Exporting a validate function for cross-storage session checks
export const validateCrossStorageSession = async (options: VerifySessionOptions = {}): Promise<boolean> => {
  // This is a wrapper around verifySession that handles cross-storage session validation
  // It's particularly useful for mobile platforms where session state may be inconsistent
  return verifySession(options);
};
