
import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { login, register, logout, getUserProfile } = useAuthActions();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSupabaseUser(session.user);
        
        // Get user profile from database
        const profile = await getUserProfile(session.user.id);
        
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: profile.first_name,
            lastName: profile.last_name,
            address: profile.address
          });
          setIsLoggedIn(true);
        }
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSupabaseUser(session.user);
        
        // Get user profile from database
        const profile = await getUserProfile(session.user.id);
        
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: profile.first_name,
            lastName: profile.last_name,
            address: profile.address
          });
          setIsLoggedIn(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [getUserProfile]);

  // Login wrapper
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    return success;
  };

  // Register wrapper
  const handleRegister = async (userData: any): Promise<boolean> => {
    const success = await register(userData);
    return success;
  };

  // Logout wrapper
  const handleLogout = async (): Promise<void> => {
    await logout();
    setSupabaseUser(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        supabaseUser, 
        isLoggedIn, 
        login: handleLogin, 
        logout: handleLogout, 
        register: handleRegister 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
