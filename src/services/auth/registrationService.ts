
import { supabase } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';

// Handle registration functionality
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
