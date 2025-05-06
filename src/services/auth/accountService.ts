
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { clearAuthStorage } from './storageService';

// Delete user account - enhanced implementation with improved error handling, verification, and feedback
export const deleteUserAccount = async (password: string): Promise<boolean> => {
  try {
    // Show initial toast to inform user the process has started
    const processingToastId = toast({
      title: "Processing",
      description: "Account deletion in progress...",
    });
    
    // First verify the user's password
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
      throw new Error("No authenticated user found");
    }
    
    const email = currentUser.data.user.email || '';
    
    // Verify the password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (verifyError) {
      console.error("Password verification error:", verifyError);
      throw new Error("Incorrect password, please try again");
    }
    
    console.log("Password verified, proceeding with account deletion");
    
    // Call the Supabase Edge Function to handle the deletion with proper dependency management
    try {
      // Get current session for authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const authHeader = sessionData?.session?.access_token 
        ? `Bearer ${sessionData.session.access_token}`
        : null;
      
      if (!authHeader) {
        throw new Error("No active session found");
      }
      
      // Call edge function with proper authorization
      const { data, error } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
        headers: {
          Authorization: authHeader
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      console.log("Edge function response:", data);
      
      // Dismiss the processing toast
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
        variant: "default"
      });
      
      // Immediately sign out the user to clear the session
      await supabase.auth.signOut({ scope: 'global' });
      
      // Also clear local storage manually to ensure all traces of the session are gone
      clearAuthStorage();
      
      // Check response for success indicator
      if (data && data.success === true) {
        console.log("Account deletion successful:", data.message);
        
        // Check email availability status
        if (data.emailAvailable === false) {
          console.warn("Warning: Email may not be available for re-registration. Showing toast.");
          toast({
            title: "Account partially deleted",
            description: "Your data was removed, but your email might not be available for re-registration immediately. Please try again later or contact support.",
            variant: "destructive"
          });
        }
        
        // Force a page reload to clear any lingering state
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        
        return true;
      } else {
        console.error("Unexpected edge function response:", data);
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (funcError) {
      console.error("Edge function failed:", funcError);
      toast({
        title: "Account deletion failed",
        description: funcError instanceof Error ? funcError.message : "An unexpected error occurred",
        variant: "destructive"
      });
      throw new Error(`Failed to delete account: ${funcError instanceof Error ? funcError.message : String(funcError)}`);
    }
  } catch (error) {
    console.error("Delete account error:", error);
    toast({
      title: "Account deletion failed",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};
