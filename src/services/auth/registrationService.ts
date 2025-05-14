
import { supabase } from '@/integrations/supabase/client';
import { RegisterData, User } from '@/types/auth';
import { AuthApiError, PostgrestError } from '@supabase/supabase-js';

export const registerUser = async (
  registerData: RegisterData
): Promise<{ user: User | null; error: null | AuthApiError | PostgrestError }> => {
  try {
    // Step 1: Register the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          first_name: registerData.firstName,
          last_name: registerData.lastName,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error.message);
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: null };
    }

    // Step 2: Create a record in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: registerData.email,
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          // Note: These properties exist in database but not in our User type
          // address: registerData.address,
          // phone: registerData.phone,
          // kennel_name: registerData.kennel_name,
        },
      ]);

    if (profileError) {
      console.error('Error creating user profile:', profileError.message);
      return { user: null, error: profileError };
    }

    // Step 3: Construct the User object
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      // Note: These properties exist in database but not in our User type
      // address: registerData.address || '',
      // phone: registerData.phone || '',
    };

    return { user, error: null };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return { 
      user: null, 
      error: { 
        message: 'Unexpected error during registration' 
      } as AuthApiError 
    };
  }
};
