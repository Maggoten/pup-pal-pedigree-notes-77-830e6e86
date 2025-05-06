
import { supabase, Profile } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';

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

// Delete user account - enhanced implementation with improved error handling and immediate session cleanup
export const deleteUserAccount = async (password: string): Promise<boolean> => {
  try {
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
      const { data, error } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      console.log("Edge function response:", data);
      
      // Immediately sign out the user to clear the session
      await supabase.auth.signOut({ scope: 'global' });
      
      // Also clear local storage manually to ensure all traces of the session are gone
      removeUserFromStorage();
      
      // Check response for success indicator
      if (data && data.success === true) {
        console.log("Account deletion successful:", data.message);
        
        // Force a page reload to clear any lingering state
        window.location.reload();
        
        return true;
      } else {
        console.error("Unexpected edge function response:", data);
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (funcError) {
      console.error("Edge function failed:", funcError);
      throw new Error(`Failed to delete account: ${funcError instanceof Error ? funcError.message : String(funcError)}`);
    }
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
};

// Save user data to local storage - not needed with Supabase but kept for compatibility
export const saveUserToStorage = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

// Remove user data from local storage - not needed with Supabase but kept for compatibility
export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  // Clear all Supabase-related storage
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.refreshToken');
  localStorage.removeItem('supabase.auth.user');
  // Clear any other potential auth-related items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      localStorage.removeItem(key);
    }
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
