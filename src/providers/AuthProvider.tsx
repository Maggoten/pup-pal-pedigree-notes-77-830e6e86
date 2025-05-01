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
  const authErrorDisplayedRef = useRef(false);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isSubscribed = true;
    console.log('AuthProvider: Initializing...');
    
    // First check for existing session to prevent flicker
    const checkExistingSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user && isSubscribed) {
          console.log('AuthProvider: Initial session found');
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          setIsLoggedIn(true);
          
          // Get basic user info immediately
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email || '',
            firstName: '',
            lastName: '',
            address: ''
          });
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      }
    };
    
    // Check for existing session first
    checkExistingSession();
    
    // THEN set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change event:', event);
        
        if (!isSubscribed) return;
        
        setSession(currentSession);
        setIsLoggedIn(!!currentSession);
        
        if (currentSession?.user) {
          console.log('User authenticated:', currentSession.user.id);
          setSupabaseUser(currentSession.user);
          
          // Set basic user info immediately
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: '',
            lastName: '',
            address: ''
          });
          
          // Fetch full profile in background
          setTimeout(() => {
            if (!isSubscribed) return;
            if (isFetchingProfileRef.current) return;
            
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
                  console.log('Profile retrieved successfully');
                }
              })
              .catch(err => {
                console.error('Failed to fetch profile:', err);
              })
              .finally(() => {
                isFetchingProfileRef.current = false;
              });
          }, 0);
        } else {
          if (event === 'SIGNED_OUT' && isSubscribed) {
            setUser(null);
            setSupabaseUser(null);
            setIsLoggedIn(false);
          }
        }
      }
    );

    // Finish loading once the initial checks are done
    setTimeout(() => {
      if (isSubscribed) {
        setIsLoading(false);
        console.log('AuthProvider: Initialization complete');
      }
    }, 500);
    
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
