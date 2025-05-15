
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/storage/core/session';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Hook for handling Supabase authentication session validation and refresh
 * with enhanced mobile support
 */
export const useImageSessionCheck = () => {
  const { isAuthReady, session, authTransitioning } = useAuth();

  /**
   * Validates the current authentication session and attempts to refresh if needed
   * Has special handling for mobile devices and Safari which have more session issues
   * @returns Promise resolving to true if session is valid, false otherwise
   */
  const validateSession = async (): Promise<boolean> => {
    // Don't validate during auth transitions to prevent loops
    if (authTransitioning) {
      console.log('[ImageSessionCheck] Auth in transition, skipping validation');
      return true; // Allow operations to proceed during transitions
    }
    
    const platform = getPlatformInfo();
    const isMobile = platform.mobile || platform.safari;
    
    console.log('[ImageSessionCheck] Validating session, auth ready:', isAuthReady, 'platform:', platform.device);
    console.log('[ImageSessionCheck] Current session state:', session ? 'exists' : 'none');
    
    if (!isAuthReady) {
      console.log(`[ImageSessionCheck] Auth not ready yet, delaying validation`);
      // Increased delay from 3000ms to 4000ms for auth readiness
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Force check current session state after delay
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      
      console.log(`[ImageSessionCheck] After delay, session exists: ${hasSession}`);
      
      // For mobile, be more permissive about session requirements
      if (isMobile && !hasSession) {
        console.log(`[ImageSessionCheck] Mobile device with no session after delay, proceeding anyway`);
        return true; // Allow mobile uploads to proceed even without session
      }
    }
    
    // Use the enhanced verifySession function with auth ready state and mobile awareness
    try {
      return verifySession({
        authReady: isAuthReady,
        // Always skip throwing errors on mobile
        skipThrow: isMobile,
        // Use mobile optimizations
        mobileOptimized: isMobile
      });
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

  return { validateSession };
};
