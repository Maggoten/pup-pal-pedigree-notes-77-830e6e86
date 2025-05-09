
import { supabase } from '@/integrations/supabase/client';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/storage/core/session';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook for handling Supabase authentication session validation and refresh
 */
export const useImageSessionCheck = () => {
  const { isAuthReady } = useAuth();

  /**
   * Validates the current authentication session and attempts to refresh if needed
   * Has special handling for mobile devices and Safari which have more session issues
   */
  const validateSession = async (): Promise<boolean> => {
    // Use the enhanced verifySession function with auth ready state
    return verifySession({
      respectAuthReady: true,
      authReady: isAuthReady
    });
  };

  return { validateSession };
};
