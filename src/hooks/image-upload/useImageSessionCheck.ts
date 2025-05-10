
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/storage/core/session';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook for handling Supabase authentication session validation and refresh
 * with enhanced mobile support
 */
export const useImageSessionCheck = () => {
  const { isAuthReady, session } = useAuth();

  /**
   * Validates the current authentication session and attempts to refresh if needed
   * Has special handling for mobile devices and Safari which have more session issues
   * @returns Promise resolving to true if session is valid, false otherwise
   */
  const validateSession = async (): Promise<boolean> => {
    const platform = getPlatformInfo();
    const isMobile = platform.mobile || platform.safari;
    
    console.log('[ImageSessionCheck] Validating session, auth ready:', isAuthReady, 'platform:', platform.device);
    console.log('[ImageSessionCheck] Current session state:', session ? 'exists' : 'none');
    
    if (!isAuthReady) {
      console.log(`[ImageSessionCheck] Auth not ready yet, delaying validation`);
      // Increased delay for auth readiness
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Force check current session state after delay
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      
      console.log(`[ImageSessionCheck] After delay, session exists: ${hasSession}`);
      
      // More permissive session handling for mobile
      if (isMobile) {
        console.log(`[ImageSessionCheck] Mobile device detected, proceeding with upload regardless of session state`);
        return true; // Always allow mobile uploads to proceed
      }
    }
    
    // For mobile devices, attempt to refresh session first
    if (isMobile && session) {
      try {
        console.log('[ImageSessionCheck] Mobile device detected, attempting session refresh');
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data.session) {
          console.log('[ImageSessionCheck] Session refreshed successfully');
        } else {
          console.warn('[ImageSessionCheck] Session refresh failed:', error);
        }
      } catch (refreshError) {
        console.error('[ImageSessionCheck] Error during session refresh:', refreshError);
        // Continue despite refresh errors on mobile
      }
    }
    
    // Use the enhanced verifySession function with auth ready state and mobile awareness
    try {
      return verifySession({
        respectAuthReady: true,
        authReady: isAuthReady,
        // Always skip throwing errors on mobile
        skipThrow: isMobile,
        platform: platform
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
