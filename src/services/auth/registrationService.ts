
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { createUserFromSupabaseSession } from '@/utils/auth/sessionUtils';

interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const registerUser = async ({ email, password, firstName, lastName }: RegistrationData): Promise<User> => {
  // Register the user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user returned from registration');
  }

  // After successful registration, check if the profile was created via trigger
  // Use the profiles table instead of 'users'
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.warn('Error fetching user profile after registration:', profileError);
    // Continue anyway as this may be expected if profile creation is delayed
  }

  // Create a User object that satisfies our interface
  const user = createUserFromSupabaseSession(data.user);

  return user;
};
