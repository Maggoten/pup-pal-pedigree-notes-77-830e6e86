
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Profile } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  signIn: (email: string) => Promise<void>; // Add the signIn method to the interface
  signOut: () => Promise<void>; // Keep signOut for backward compatibility
}
