
import { supabase, Profile } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Handle login functionality
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.error("Login error:", error);
    return null;
  }
  
  // Get user profile from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, address')
    .eq('id', data.user.id)
    .single();
  
  if (profile) {
    return {
      id: data.user.id,
      email: data.user.email || '',
      firstName: profile.first_name,
      lastName: profile.last_name,
      address: profile.address
    };
  }
  
  return null;
};

// Handle registration functionality with improved implementation
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
    // Register the user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Since address was removed from RegisterData, use empty string
          address: ''
        }
      }
    });
    
    if (error || !data.user) {
      console.error("Registration error:", error);
      return null;
    }
    
    // The profile is created automatically via database trigger
    return {
      id: data.user.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: '' // Use empty string since address field was removed
    };
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

// Delete user account - enhanced implementation with improved error handling, verification, and feedback
export const deleteUserAccount = async (password: string): Promise<boolean> => {
  try {
    // Show initial toast to inform user the process has started
    const processingToast = toast({
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
        id: processingToast.id,
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
        variant: "default"
      });
      
      // Immediately sign out the user to clear the session
      await supabase.auth.signOut({ scope: 'global' });
      
      // Also clear local storage manually to ensure all traces of the session are gone
      removeUserFromStorage();
      
      // Check response for success indicator
      if (data && data.success === true) {
        console.log("Account deletion successful:", data.message);
        
        // Check email availability status
        if (data.emailAvailable === false) {
          console.warn("Warning: Email may not be available for re-registration. Showing toast.");
          toast({
            title: "Account partially deleted",
            description: "Your data was removed, but your email might not be available for re-registration immediately. Please try again later or contact support.",
            variant: "warning"
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

// Enhanced version to ensure thorough cleanup of all auth-related items
export const removeUserFromStorage = () => {
  try {
    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Clear all Supabase-related storage items
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.user');
    localStorage.removeItem('sb-yqcgqriecxtppuvcguyj-auth-token');
    
    // Clear any session/local storage items that contain these keys
    const itemsToRemove = [];
    
    // Identify items to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('sb-') ||
        key.includes('token')
      )) {
        itemsToRemove.push(key);
      }
    }
    
    // Remove items separately to avoid index shifting issues
    itemsToRemove.forEach(key => {
      console.log(`Removing storage item: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Also clear cookies that might be related to authentication
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    console.log('All auth-related storage items cleared');
  } catch (e) {
    console.error('Error during storage cleanup:', e);
  }
};

// Get user data from local storage - not needed with Supabase but kept for compatibility
export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

// Check if user is logged in from local storage - not needed with Supabase but kept for compatibility
export const getLoggedInStateFromStorage = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// Save user data to local storage - not needed with Supabase but kept for compatibility
export const saveUserToStorage = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};
