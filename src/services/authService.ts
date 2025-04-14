
import { User, RegisterData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Handle login functionality
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Login error:", error.message);
      return null;
    }
    
    if (!data.user) return null;
    
    // Get user profile from profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return {
      email: data.user.email || '',
      firstName: profileData?.first_name || '',
      lastName: profileData?.last_name || '',
      address: profileData?.address || '',
      id: data.user.id
    };
  } catch (error) {
    console.error("Unexpected login error:", error);
    return null;
  }
};

// Handle registration functionality
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
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
    
    if (error) {
      console.error("Registration error:", error.message);
      return null;
    }
    
    if (!data.user) return null;
    
    return {
      email: data.user.email || '',
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address,
      id: data.user.id
    };
  } catch (error) {
    console.error("Unexpected registration error:", error);
    return null;
  }
};

// Save user data to local storage
export const saveUserToStorage = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

// Remove user data from local storage
export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
};

// Get user data from local storage
export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

// Check if user is logged in from local storage
export const getLoggedInStateFromStorage = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// Log out user from Supabase
export const logoutUserFromSupabase = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
