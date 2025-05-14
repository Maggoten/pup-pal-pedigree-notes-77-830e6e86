
import { supabase } from '@/integrations/supabase/client';
import { LoginData, User } from '@/types/auth';
import { AuthApiError, PostgrestError } from '@supabase/supabase-js';

export const loginUser = async (
  loginData: LoginData
): Promise<{ user: User | null; error: null | AuthApiError | PostgrestError }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginData.email,
    password: loginData.password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return { user: null, error };
  }

  if (!data.user) {
    return { user: null, error: null };
  }

  // Get the user metadata from the user
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    console.error('Error fetching user data:', userError.message);
  }

  // Construct the User object from both auth data and database data
  const user: User = {
    id: data.user.id,
    email: data.user.email || '',
    firstName: userData?.first_name || '',
    lastName: userData?.last_name || '',
    // Note: These properties exist in database but not in our User type
    // address: userData?.address || '',
    // phone: userData?.phone || '',
  };

  return { user, error: null };
};
