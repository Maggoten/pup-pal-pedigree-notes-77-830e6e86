
import { STORAGE_ERRORS } from '../config';
import { getPlatformInfo } from '../mobileUpload';
import { verifySession as centralVerifySession } from '@/utils/auth/sessionManager';

/**
 * Verifies and refreshes authentication session if needed
 * This is a wrapper around the central session manager to maintain compatibility
 * 
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
  
  try {
    // Use the central session management utility for consistency
    const isSessionValid = await centralVerifySession({
      force: false,
      respectAuthReady: options?.respectAuthReady,
      authReady: options?.authReady,
      skipThrow: options?.skipThrow
    });
    
    if (!isSessionValid) {
      console.log('[Session] Session invalid, checking if we should throw');
      
      // Special handling for mobile devices - allow operations even with invalid sessions
      if (isMobile && options?.skipThrow) {
        console.log(`[Session] ${platform.device} detected, allowing operation despite invalid session`);
        return true;
      }
      
      if (options?.skipThrow) {
        return false;
      }
      
      throw new Error(STORAGE_ERRORS.NO_SESSION);
    }
    
    console.log('[Session] Active session confirmed');
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
