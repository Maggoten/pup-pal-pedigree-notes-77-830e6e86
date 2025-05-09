
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/storage/core/session';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook for handling Supabase authentication session validation and refresh
 * with enhanced mobile support
 */
export const useImageSessionCheck = () => {
  const { isAuthReady } = useAuth();

  /**
   * Validates the current authentication session and attempts to refresh if needed
   * Has special handling for mobile devices and Safari which have more session issues
   * @returns Promise resolving to true if session is valid, false otherwise
   */
  const validateSession = async (): Promise<boolean> => {
    const platform = getPlatformInfo();
    const isMobile = platform.mobile || platform.safari;
    
    console.log('[ImageSessionCheck] Validating session, auth ready:', isAuthReady, 'platform:', platform.device);
    
    // For mobile, add additional delay to ensure auth is fully ready
    if (isMobile && !isAuthReady) {
      console.log(`[ImageSessionCheck] Mobile detected (${platform.device}), adding extra delay before validation`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Recheck auth readiness after delay
      if (!isAuthReady) {
        console.log('[ImageSessionCheck] Auth still not ready after delay, proceeding with caution');
      }
    }
    
    // Use the enhanced verifySession function with auth ready state and mobile awareness
    return verifySession({
      respectAuthReady: true,
      authReady: isAuthReady,
      skipThrow: false,
      platform: platform
    });
  };

  return { validateSession };
};
