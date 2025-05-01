
import { useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { login, register, logout, getUserProfile } = useAuthActions();
  const isFetchingProfileRef = useRef(false);
  const initializedRef = useRef(false);
  
  // Set up auth state listener and check for existing session - only once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    console.log('AuthProvider: Initializing once...');
    let isSubscribed = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isSubscribed) return;
        
        console.log('Auth state change event:', event);
        setSession(currentSession);
        setIsLoggedIn(!!currentSession);
        setSupabaseUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: '',
            lastName: '',
            address: ''
          });
          
          // Fetch profile in background
          if (!isFetchingProfileRef.current) {
            isFetchingProfileRef.current = true;
            getUserProfile(currentSession.user.id)
              .then(profile => {
                if (profile && isSubscribed) {
                  setUser(prev => ({
                    ...prev!,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    address: profile.address
                  }));
                }
              })
              .catch(err => {
                console.error('Failed to fetch profile:', err);
              })
              .finally(() => {
                isFetchingProfileRef.current = false;
              });
          }
        } else if (event === 'SIGNED_OUT' && isSubscribed) {
          setUser(null);
          setSupabaseUser(null);
          setIsLoggedIn(false);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isSubscribed) return;
      
      if (initialSession?.user) {
        console.log('AuthProvider: Initial session found');
        setSession(initialSession);
        setSupabaseUser(initialSession.user);
        setIsLoggedIn(true);
        
        setUser({
          id: initialSession.user.id,
          email: initialSession.user.email || '',
          firstName: '',
          lastName: '',
          address: ''
        });
      }
      
      setIsLoading(false);
    });
    
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [getUserProfile]);

  // Login wrapper
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        console.log('Login failed in handleLogin');
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
      setSupabaseUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        supabaseUser,
        session,
        isLoggedIn, 
        loading: isLoading, // for backward compatibility
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
