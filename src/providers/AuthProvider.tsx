
import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { login, register, logout, getUserProfile } = useAuthActions();

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change event:', event);
        
        setSession(currentSession);
        setIsLoggedIn(!!currentSession);
        
        if (currentSession?.user) {
          console.log('User authenticated:', currentSession.user.id);
          
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            try {
              // Get user profile from database
              const profile = await getUserProfile(currentSession.user.id);
              
              if (profile) {
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  address: profile.address
                });
              } else {
                console.warn('No profile found for authenticated user');
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', initialSession ? 'Session exists' : 'No session');
        
        if (initialSession?.user) {
          setSession(initialSession);
          setIsLoggedIn(true);
          
          // Get user profile from database
          const profile = await getUserProfile(initialSession.user.id);
          
          if (profile) {
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              firstName: profile.first_name,
              lastName: profile.last_name,
              address: profile.address
            });
          }
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [getUserProfile]);

  // Login wrapper
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  // Register wrapper
  const handleRegister = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await register(userData);
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout wrapper
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logout();
      setSession(null);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        isLoggedIn, 
        isLoading,
        login: handleLogin, 
        logout: handleLogout, 
        register: handleRegister 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
