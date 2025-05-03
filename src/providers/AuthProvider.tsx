
import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
// Import toast but we'll disable the error notifications
import { toast } from '@/hooks/use-toast';

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

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isSubscribed = true;
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change event:', event);
        
        if (!isSubscribed) return;
        
        setSession(currentSession);
        setIsLoggedIn(!!currentSession);
        
        if (currentSession?.user) {
          console.log('User authenticated:', currentSession.user.id);
          setSupabaseUser(currentSession.user);
          
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            try {
              if (!isSubscribed) return;
              
              // Get user profile from database with retry logic
              let retryCount = 0;
              let profile = null;
              
              while (retryCount < 3 && !profile) {
                try {
                  profile = await getUserProfile(currentSession.user.id);
                  if (profile) break;
                } catch (err) {
                  console.log(`Profile fetch attempt ${retryCount + 1} failed:`, err);
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
                }
                retryCount++;
              }
              
              if (profile) {
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  firstName: profile.first_name,
                  lastName: profile.last_name
                });
              } else {
                console.error('Failed to fetch profile after retries');
                // REMOVED: Toast error notification for beta testing
                // Use a fallback approach instead - create a minimal user object
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  firstName: '',
                  lastName: ''
                });
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
              // REMOVED: Toast error notification for beta testing
            }
          }, 0);
        } else {
          if (isSubscribed) {
            setUser(null);
            setSupabaseUser(null);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          if (isSubscribed) {
            setUser(null);
            setSupabaseUser(null);
            setIsLoggedIn(false);
          }
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', initialSession ? 'Session exists' : 'No session');
        
        if (initialSession?.user && isSubscribed) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          setIsLoggedIn(true);
          
          // Get user profile from database with retry logic
          let retryCount = 0;
          let profile = null;
          
          while (retryCount < 3 && !profile) {
            try {
              profile = await getUserProfile(initialSession.user.id);
              if (profile) break;
            } catch (err) {
              console.log(`Initial profile fetch attempt ${retryCount + 1} failed:`, err);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retryCount++;
          }
          
          if (profile && isSubscribed) {
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              firstName: profile.first_name,
              lastName: profile.last_name
            });
          } else if (isSubscribed) {
            console.error('Failed to fetch initial profile after retries');
            // REMOVED: Toast error notification for beta testing
            // Use a fallback approach instead - create a minimal user object
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              firstName: '',
              lastName: ''
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
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [getUserProfile]);

  // Login wrapper
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await login(email, password);
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
