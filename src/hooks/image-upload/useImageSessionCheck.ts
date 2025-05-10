
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession, refreshSession } from '@/utils/auth/sessionManager';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

/**
 * Hook for handling Supabase authentication session validation and refresh
 * with enhanced mobile support and centralized session management
 */
export const useImageSessionCheck = () => {
  const { isAuthReady, session } = useAuth();
  const [sessionValidated, setSessionValidated] = useState(false);

  // Check session on mount and when auth state changes
  useEffect(() => {
    if (isAuthReady) {
      // Validate session asynchronously
      validateSession().then(isValid => {
        setSessionValidated(isValid);
      });
    }
  }, [isAuthReady, session]);

  /**
   * Validates the current authentication session and attempts to refresh if needed
   * Has special handling for mobile devices and Safari which have more session issues
   * @returns Promise resolving to true if session is valid, false otherwise
   */
  const validateSession = async (): Promise<boolean> => {
    const platform = getPlatformInfo();
    const isMobile = platform.mobile || platform.safari;
    
    console.log('[ImageSessionCheck] Validating session, auth ready:', isAuthReady, 'platform:', platform.device);
    
    if (!isAuthReady) {
      console.log(`[ImageSessionCheck] Auth not ready yet, delaying validation`);
      // Increased delay for auth readiness
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Use the centralized session verification
    try {
      // First try verifying without forcing refresh
      let isValid = await verifySession();
      
      if (!isValid && isMobile) {
        console.log(`[ImageSessionCheck] Initial verification failed on ${platform.device}, attempting refresh`);
        // For mobile devices, attempt an explicit refresh
        await refreshSession();
        // Try verification again
        isValid = await verifySession(true);
      }
      
      if (!isValid) {
        console.log(`[ImageSessionCheck] Session invalid after verification attempts`);
        
        // For mobile, continue despite errors
        if (isMobile) {
          console.log('[ImageSessionCheck] Allowing operation despite validation errors on mobile');
          return true;
        }
      } else {
        console.log(`[ImageSessionCheck] Session validated successfully`);
      }
      
      return isValid;
    } catch (error) {
      console.error('[ImageSessionCheck] Session validation error:', error);
      
      // For mobile, continue despite errors
      if (isMobile) {
        console.log('[ImageSessionCheck] Allowing operation despite validation error on mobile');
        return true;
      }
      
      return false;
    }
  };

  return { validateSession, sessionValidated };
};
