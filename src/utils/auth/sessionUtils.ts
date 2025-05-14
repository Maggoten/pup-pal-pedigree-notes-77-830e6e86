
import { User } from '@/types/auth';

// Create a user object from a profile and user ID
export const createUserFromSupabase = (profile: any, userId: string, userEmail?: string | null): User => {
  return {
    id: userId,
    email: userEmail || profile?.email || '',
    firstName: profile?.firstName || profile?.first_name || '',
    lastName: profile?.lastName || profile?.last_name || '',
    address: profile?.address || '',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };
};

// Map a Supabase user to our app's user format
export const createUserFromSupabaseSession = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    firstName: supabaseUser.user_metadata?.firstName || supabaseUser.user_metadata?.first_name || '',
    lastName: supabaseUser.user_metadata?.lastName || supabaseUser.user_metadata?.last_name || '',
    address: supabaseUser.user_metadata?.address || '',
    app_metadata: supabaseUser.app_metadata || {},
    user_metadata: supabaseUser.user_metadata || {},
    aud: supabaseUser.aud || 'authenticated',
    created_at: supabaseUser.created_at || new Date().toISOString()
  };
};

// Map a profile and user to our app user format
export const mapUserProfile = (profile: any, userId: string, userEmail?: string | null): User => {
  const user: User = {
    id: userId,
    email: userEmail || profile?.email || '',
    firstName: profile?.firstName || profile?.first_name || '',
    lastName: profile?.lastName || profile?.last_name || '',
    address: profile?.address || '',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };

  return user;
};
