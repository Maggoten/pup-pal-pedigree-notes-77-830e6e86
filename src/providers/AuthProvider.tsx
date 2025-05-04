
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

// Add device detection utility
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { login, register, logout, getUserProfile } = useAuthActions();

  // Log device info immediately
  useEffect(() => {
    const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
    console.log(`[Auth Debug] Device type: ${deviceType}, User Agent: ${navigator.userAgent}`);
  }, []);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isSubscribed = true;
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`[Auth Debug] Auth state change event: ${event}`);
        console.log(`[Auth Debug] Session exists: ${!!currentSession}`);
        console.log(`[Auth Debug] User ID from session: ${currentSession?.user?.id || 'none'}`);
        
        if (!isSubscribed) return;
        
        setSession(currentSession);
        setIsLoggedIn(!!currentSession);
        
        if (currentSession?.user) {
          console.log(`[Auth Debug] User authenticated: ${currentSession.user.id}`);
          console.log(`[Auth Debug] Auth provider: ${currentSession.user.app_metadata?.provider || 'email'}`);
          setSupabaseUser(currentSession.user);
          
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            try {
              if (!isSubscribed) return;
              
              console.log(`[Auth Debug] Fetching profile for user: ${currentSession.user.id}`);
              // Get user profile from database with retry logic
              let retryCount = 0;
              let profile = null;
              
              while (retryCount < 3 && !profile) {
                try {
                  profile = await getUserProfile(currentSession.user.id);
                  if (profile) {
                    console.log(`[Auth Debug] Profile retrieved: success`);
                    break;
                  }
                  console.log(`[Auth Debug] Profile fetch attempt ${retryCount + 1} returned null`);
                } catch (err) {
                  console.log(`[Auth Debug] Profile fetch attempt ${retryCount + 1} failed:`, err);
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
                }
                retryCount++;
              }
              
              if (profile) {
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  address: profile.address
                });
                console.log(`[Auth Debug] User object set with profile data`);
              } else {
                console.error('[Auth Debug] Failed to fetch profile after retries');
                // Use a fallback approach instead - create a minimal user object
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  firstName: '',
                  lastName: '',
                  address: ''
                });
                console.log(`[Auth Debug] User object set with fallback data`);
              }
            } catch (error) {
              console.error('[Auth Debug] Error in auth state change handler:', error);
            }
          }, 0);
        } else {
          if (isSubscribed) {
            setUser(null);
            setSupabaseUser(null);
            console.log(`[Auth Debug] User and supabaseUser set to null (no session)`);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          if (isSubscribed) {
            setUser(null);
            setSupabaseUser(null);
            setIsLoggedIn(false);
            console.log(`[Auth Debug] Sign out event processed, state cleared`);
          }
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        console.log(`[Auth Debug] Initial session check: ${initialSession ? 'Session exists' : 'No session'}`);
        console.log(`[Auth Debug] Initial user ID: ${initialSession?.user?.id || 'none'}`);
        
        if (initialSession?.user && isSubscribed) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          setIsLoggedIn(true);
          
          console.log(`[Auth Debug] Initial auth token length: ${initialSession.access_token.length}`);
          
          // Get user profile from database with retry logic
          let retryCount = 0;
          let profile = null;
          
          while (retryCount < 3 && !profile) {
            try {
              console.log(`[Auth Debug] Initial profile fetch attempt ${retryCount + 1}`);
              profile = await getUserProfile(initialSession.user.id);
              if (profile) break;
            } catch (err) {
              console.log(`[Auth Debug] Initial profile fetch attempt ${retryCount + 1} failed:`, err);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            retryCount++;
          }
          
          if (profile && isSubscribed) {
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              firstName: profile.first_name,
              lastName: profile.last_name,
              address: profile.address
            });
            console.log(`[Auth Debug] Initial profile retrieved successfully`);
          } else if (isSubscribed) {
            console.error('[Auth Debug] Failed to fetch initial profile after retries');
            // Use a fallback approach instead - create a minimal user object
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              firstName: '',
              lastName: '',
              address: ''
            });
            console.log(`[Auth Debug] Initial profile fallback created`);
          }
        } else {
          console.log(`[Auth Debug] No initial session found`);
        }
      } catch (error) {
        console.error('[Auth Debug] Error checking initial session:', error);
      } finally {
        setIsLoading(false);
        console.log(`[Auth Debug] Auth initialization complete, loading state set to false`);
      }
    };

    initializeAuth();
    
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      console.log(`[Auth Debug] Auth subscription cleanup`);
    };
  }, [getUserProfile]);

  // Login wrapper
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log(`[Auth Debug] Login attempt for: ${email}`);
    try {
      const success = await login(email, password);
      console.log(`[Auth Debug] Login result: ${success ? 'success' : 'failed'}`);
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  // Register wrapper
  const handleRegister = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    console.log(`[Auth Debug] Registration attempt for: ${userData.email}`);
    try {
      const success = await register(userData);
      console.log(`[Auth Debug] Registration result: ${success ? 'success' : 'failed'}`);
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout wrapper
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    console.log(`[Auth Debug] Logout attempt`);
    try {
      await logout();
      setSession(null);
      setUser(null);
      setSupabaseUser(null);
      setIsLoggedIn(false);
      console.log(`[Auth Debug] Logout complete`);
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
