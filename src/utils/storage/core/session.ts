
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_ERROR_CODES } from '../config';

interface VerifySessionOptions {
  skipThrow?: boolean;
}

/**
 * Verify that a valid session exists
 * @param options Options for verification
 * @returns True if session exists, false otherwise
 * @throws Error if no session exists (unless skipThrow is true)
 */
export const verifySession = async (options: VerifySessionOptions = {}): Promise<boolean> => {
  try {
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
