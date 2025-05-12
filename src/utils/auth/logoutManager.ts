
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { clearSessionState } from './sessionManager';

interface LogoutOptions {
  clearIntervals?: () => void;
}

/**
 * Central function to handle logout state cleaning
 * 
 * @param baseLogout The base logout function from the auth provider
 * @param resetState Optional function to reset local state
 * @param options Additional options for cleanup
 */
export async function handleLogoutState(
  baseLogout: () => Promise<void>,
  resetState?: () => void,
  options?: LogoutOptions
): Promise<void> {
  try {
    console.log('[Auth Debug] Logout initiated');
    
    // First clean up any intervals to prevent race conditions
    if (options?.clearIntervals) {
      options.clearIntervals();
    }
    
    // Clear any session state
    clearSessionState();
    
    // Execute base logout
    await baseLogout();
    console.log('[Auth Debug] Base logout completed');
    
    // Reset local state if provided
    if (resetState) {
      resetState();
      console.log('[Auth Debug] Local state reset');
    }
    
    // Clear supabase data from storage
    try {
      await supabase.auth.signOut({ scope: 'local' });
      console.log('[Auth Debug] Supabase local signout completed');
    } catch (error) {
      console.error('[Auth Debug] Error during supabase signout:', error);
    }
    
    // Additional cleanup
    try {
      localStorage.removeItem('supabase.auth.token');
    } catch (storageError) {
      // Ignore storage errors
      console.warn('[Auth Debug] Could not clear localStorage:', storageError);
    }
    
    // Set a small delay to ensure all async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('[Auth Debug] Logout completed successfully');
  } catch (error) {
    console.error('[Auth Debug] Error during logout:', error);
    
    // Still try to reset state even if logout failed
    if (resetState) {
      resetState();
    }
    
    // Show error notification
    toast({
      title: "Logout issue",
      description: "There was a problem during logout. Please refresh the browser.",
      variant: "destructive",
    });
    
    // Force reload as last resort
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}
