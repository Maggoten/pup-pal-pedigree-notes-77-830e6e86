
import { toast } from '@/hooks/use-toast';
import { resetQueryClient, handleAuthStateChange } from '@/utils/reactQueryConfig';
import { clearSessionState } from './sessionManager';

/**
 * Central manager for handling logout operations
 * This ensures consistent state clearing and UI behavior
 */
export const handleLogoutState = async (
  logoutFn: () => Promise<void>,
  stateResetFn: () => void,
  options: {
    clearIntervals?: () => void;
  } = {}
) => {
  console.log('[Auth Debug] Enhanced logout starting - clearing all auth state');
  
  // Clear query cache before logout
  resetQueryClient();
  
  try {
    // Clear any intervals if provided
    if (options.clearIntervals) {
      options.clearIntervals();
    }
    
    // Execute the base logout function
    await logoutFn();
    
    // Clear session state in the central manager
    clearSessionState();
    
    // Reset all auth-related React state
    stateResetFn();
    
    // Explicitly trigger the auth state change handler
    handleAuthStateChange('SIGNED_OUT');
    
    console.log('[Auth Debug] Enhanced logout complete - all auth state cleared');
    
    toast({
      title: 'Logout successful',
      description: 'You have been logged out successfully.',
    });
    
    return true;
  } catch (error) {
    console.error('[Auth Debug] Error during enhanced logout:', error);
    
    // Even if the logout fails at the API level, reset UI state
    stateResetFn();
    
    toast({
      title: 'Logout problem',
      description: 'There was an issue during logout. Please try again.',
      variant: 'destructive',
    });
    
    return false;
  }
};
