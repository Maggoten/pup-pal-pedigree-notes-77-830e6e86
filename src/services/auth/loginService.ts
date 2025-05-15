
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginCredentials): Promise<AuthResponse> {
  // Login with email and password
  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function logout() {
  // Sign out from all tabs
  return supabase.auth.signOut({ scope: 'global' });
}
