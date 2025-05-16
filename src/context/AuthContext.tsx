
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { User as AppUser } from '@/types/auth';
import { useAuth as useNewAuth } from '@/providers/AuthProvider';

// DEPRECATION WARNING
console.warn(
  '[DEPRECATED] You are importing from @/context/AuthContext which is deprecated. ' +
  'Please update your imports to use @/providers/AuthProvider or @/hooks/useAuth instead.'
);

export interface AuthContextType {
  user: AppUser | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAuthReady: boolean; 
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create a compatibility layer that forwards to the new provider
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  loading: true,
  isLoading: true,
  isLoggedIn: false,
  isAuthReady: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {}
});

// Export the context for the provider
export default AuthContext;

// Custom hook to use the auth context - forward to new implementation
export const useAuth = () => {
  console.warn(
    '[DEPRECATED] You are using useAuth from @/context/AuthContext which is deprecated. ' +
    'Please update your imports to use @/providers/AuthProvider or @/hooks/useAuth instead.'
  );
  
  // Use the new provider's hook instead
  const newAuth = useNewAuth();
  
  // Map to old interface for compatibility
  return {
    user: newAuth.user,
    supabaseUser: newAuth.supabaseUser,
    session: newAuth.session,
    loading: newAuth.isLoading,
    isLoading: newAuth.isLoading,
    isLoggedIn: newAuth.isLoggedIn,
    isAuthReady: newAuth.isAuthReady,
    login: newAuth.login,
    register: newAuth.register,
    logout: newAuth.logout
  };
};
