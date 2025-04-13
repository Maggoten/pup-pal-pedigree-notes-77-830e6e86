
import { supabase } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';

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

    if (data.user) {
      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, address')
        .eq('id', data.user.id)
        .single();

      return {
        email: profileData?.email || data.user.email || '',
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        address: profileData?.address || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error("Login error:", error);
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

    if (data.user) {
      return {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        address: userData.address
      };
    }
    
    return null;
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

// We no longer need these localStorage functions as Supabase handles session storage
export const saveUserToStorage = (_user: User) => {};
export const removeUserFromStorage = () => {};
export const getUserFromStorage = (): User | null => null;
export const getLoggedInStateFromStorage = (): boolean => false;

// Get current session from Supabase
export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Get current user from Supabase
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) return null;
  
  // Get profile data
  const { data: profileData } = await supabase
    .from('profiles')
    .select('email, first_name, last_name, address')
    .eq('id', data.user.id)
    .single();
    
  return {
    email: profileData?.email || data.user.email || '',
    firstName: profileData?.first_name || '',
    lastName: profileData?.last_name || '',
    address: profileData?.address || ''
  };
};
