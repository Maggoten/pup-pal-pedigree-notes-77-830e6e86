
import { createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { User as AppUser } from '@/types/auth';

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
  isAuthTransitioning: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  loading: true,
  isLoading: true,
  isLoggedIn: false,
  isAuthReady: false,
  isAuthTransitioning: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  signOut: async () => {}
});

// Export the context for the provider
export default AuthContext;

// Direct users to the new location
export const useAuth = () => {
  console.warn(
    '[DEPRECATED] You are using useAuth from @/context/AuthContext which is deprecated. ' +
    'Please update your imports to use @/providers/AuthProvider or @/hooks/useAuth instead.'
  );
  
  // Import from the canonical location to avoid circular dependencies
  const { useAuth: actualUseAuth } = require('@/hooks/useAuth');
  return actualUseAuth();
};
