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

// Delete user account - corrected implementation that properly deletes from auth and returns a boolean
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
    
    // Try using the Supabase Edge Function first
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      // If edge function successful, sign out the user
      await supabase.auth.signOut();
      return true;
    } catch (funcError) {
      console.error("Edge function failed, trying fallback:", funcError);
      
      // Fallback: Try the client-side method
      // Note: We're not using RPC here since there's no delete_user function defined
      // Instead, sign out and return true - the edge function would have done the deletion
      await supabase.auth.signOut();
      return false;
    }
  } catch (error) {
    console.error("Delete account error:", error);
    return false;
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
