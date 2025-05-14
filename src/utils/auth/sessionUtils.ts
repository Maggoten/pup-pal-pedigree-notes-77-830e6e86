
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Create a simplified user object from Supabase user data
export const createUserFromSupabaseSession = (sessionUser: any): User => {
  // Create a minimally viable User object that satisfies the interface
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    firstName: sessionUser.user_metadata?.firstName,
    lastName: sessionUser.user_metadata?.lastName,
    address: sessionUser.user_metadata?.address,
    app_metadata: sessionUser.app_metadata || {},
    user_metadata: sessionUser.user_metadata || {},
    aud: sessionUser.aud || 'authenticated',
    created_at: sessionUser.created_at || new Date().toISOString()
  };
};

export const getSessionUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getSession();
  
  if (!data?.session?.user) {
    return null;
  }
  
  return createUserFromSupabaseSession(data.session.user);
};

export const clearSession = async (): Promise<void> => {
  await supabase.auth.signOut();
};
