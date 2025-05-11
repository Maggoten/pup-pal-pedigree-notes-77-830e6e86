
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types/auth';
import { queryClient, resetQueryClient } from '@/utils/reactQueryConfig';

/**
 * Core authentication API calls separated from state management
 * This allows for better testing and reuse
 */

/**
 * Log in a user with email and password
 */
export const loginUserWithEmailPassword = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string }> => {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    if (data.session) {
      console.log('User logged in successfully');
      
      // Prefetch common data for the user
      setTimeout(() => {
        queryClient.invalidateQueries();
      }, 0);
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'No session was created. Please try again.' 
      };
    }
  } catch (err) {
    console.error('Unexpected login error:', err);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Register a new user
 */
export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
}

export const registerUser = async (
  userData: RegisterUserData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { email, password, firstName, lastName, address = '' } = userData;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          address
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Reset query cache for the new user
    resetQueryClient();
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected registration error:', err);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Base logout function for calling the Supabase auth API
 */
export const logoutUserFromSupabase = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Clear all query cache before logout
    resetQueryClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected logout error:', err);
    return { 
      success: false, 
      error: 'An error occurred during logout. Your session may still be active.'
    };
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfileById = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return null;
  }
};
