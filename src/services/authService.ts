
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
    .select('*')
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
          address: userData.address
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
      address: userData.address
    };
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

// Delete user account
export const deleteUserAccount = async (password: string): Promise<boolean> => {
  try {
    // First verify the user's password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: supabase.auth.getUser().then(({ data }) => data.user?.email || ''),
      password
    });
    
    if (verifyError) {
      console.error("Password verification error:", verifyError);
      return false;
    }
    
    // Delete user account from Supabase Auth (this will cascade to profiles via RLS)
    const { error } = await supabase.auth.admin.deleteUser(
      supabase.auth.getUser().then(({ data }) => data.user?.id || '')
    );
    
    if (error) {
      console.error("Delete account error:", error);
      return false;
    }
    
    return true;
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
