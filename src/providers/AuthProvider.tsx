
import { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
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
    // Return early if already initialized to avoid multiple subscriptions
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    console.log('AuthProvider: Initializing once...');
    let isSubscribed = true;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isSubscribed) return;
        
        console.log('Auth state change event:', event);
        
        // Update session state
        setSession(currentSession);
        setIsLoggedIn(!!currentSession);
        setSupabaseUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          // Set basic user info immediately
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: '',
            lastName: '',
            address: ''
          });
          
          // Fetch profile in background if not already fetching
          if (!isFetchingProfileRef.current) {
            isFetchingProfileRef.current = true;
            try {
              const profile = await getUserProfile(currentSession.user.id);
              
              if (profile && isSubscribed) {
                setUser(prev => ({
                  ...prev!,
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  address: profile.address
                }));
              }
            } catch (err) {
              console.error('Failed to fetch profile:', err);
            } finally {
              isFetchingProfileRef.current = false;
            }
          }
        } else if (event === 'SIGNED_OUT' && isSubscribed) {
          // Clear user state on sign out
          setUser(null);
          setSupabaseUser(null);
          setIsLoggedIn(false);
        }
      }
    );

    // Initial session check
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
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
        } else {
          console.log('AuthProvider: No initial session found');
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };
    
    // Check for existing session
    checkInitialSession();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [getUserProfile]);

  // Login wrapper with better error handling
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Login attempt for:', email);
      const success = await login(email, password);
      
      if (!success) {
        console.error('Login failed in handleLogin');
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Login error in handleLogin:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
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
    } catch (error) {
      console.error('Register error in handleRegister:', error);
      return false;
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
    } catch (error) {
      console.error('Logout error in handleLogout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const authContextValue = {
    user,
    supabaseUser,
    session,
    isLoggedIn,
    loading: isLoading, // for backward compatibility
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
