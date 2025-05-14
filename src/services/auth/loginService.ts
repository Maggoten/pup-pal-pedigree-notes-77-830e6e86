
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { createUserFromSupabaseSession } from '@/utils/auth/sessionUtils';

interface LoginCredentials {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: LoginCredentials): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user returned from login');
  }

  // Get user profile data from the profiles table, not 'users'
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
  }

  // Create a User object that satisfies the interface
  const user = createUserFromSupabaseSession(data.user);
  
  // Add profile data if available
  if (profileData) {
    user.firstName = profileData.first_name;
    user.lastName = profileData.last_name;
  }

  return user;
};
