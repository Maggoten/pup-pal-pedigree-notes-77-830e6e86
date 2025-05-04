
import { useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isMobileSafari } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
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
  const [authChecks, setAuthChecks] = useState(0);  // Track auth checks for debugging
  const { login, register, logout, getUserProfile } = useAuthActions();

  // Helper to handle session errors with better mobile support
  const handleSessionError = (error: any) => {
    console.error('Session error:', error);
    
    if (isMobileSafari()) {
      // Mobile Safari specific handling
      console.debug('Handling error on Mobile Safari');
      
      // Attempt session recovery if localStorage might be available
      const attemptSessionRecovery = async () => {
        try {
          // Force a session refresh
          await supabase.auth.refreshSession();
          console.log('Mobile session recovery attempted');
        } catch (recoveryError) {
          console.error('Mobile session recovery failed:', recoveryError);
        }
      };
      
      // Try recovery after a short delay
      setTimeout(attemptSessionRecovery, 100);
    }
  };

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isSubscribed = true;
    let recoveryAttempts = 0;
    const maxRecoveryAttempts = 3;
    
    // First set up the auth state listener with special mobile handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change event:', event, 'on', isMobileSafari() ? 'Mobile Safari' : 'standard browser');
        
        if (!isSubscribed) return;
        
        try {
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
          
          // For Mobile Safari, manually verify the session is valid
          if (isMobileSafari() && event === 'SIGNED_IN') {
            console.log('Mobile Safari: manually checking session validity after SIGNED_IN event');
            setTimeout(async () => {
              try {
                const { data } = await supabase.auth.getSession();
                if (!data.session && recoveryAttempts < maxRecoveryAttempts) {
                  recoveryAttempts++;
                  console.warn(`Session lost after sign-in on Mobile Safari, recovery attempt ${recoveryAttempts}`);
                  // No need to do anything here - the user will need to log in again
                }
              } catch (error) {
                console.error('Error checking session validity on Mobile Safari:', error);
              }
            }, 500);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      }
    );

    // THEN check for existing session with mobile resilience
    const initializeAuth = async () => {
      try {
        setAuthChecks(prev => prev + 1);
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          handleSessionError(error);
          setIsLoading(false);
          return;
        }
        
        console.log('Initial session check:', initialSession ? 'Session exists' : 'No session', 
          'on', isMobileSafari() ? 'Mobile Safari' : 'standard browser');
        
        // Debug logging for mobile
        if (isMobileSafari()) {
          console.debug('Mobile session details:', {
            hasSession: !!initialSession,
            expiresAt: initialSession?.expires_at,
            tokenLength: initialSession?.access_token?.length,
          });
        }
        
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
            // Use a fallback approach instead - create a minimal user object
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              firstName: '',
              lastName: ''
            });
          }
        } else if (isMobileSafari() && !initialSession && authChecks < 2) {
          // Special mobile recovery - try again after a brief delay
          console.log('No session on Mobile Safari, scheduling another check');
          setTimeout(() => {
            if (isSubscribed) {
              initializeAuth();
            }
          }, 500);
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
  }, [getUserProfile, authChecks]);

  // Login wrapper with mobile enhancements
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log(`Login attempt for ${email} on ${isMobileSafari() ? 'Mobile Safari' : 'standard browser'}`);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        console.log('Login successful');
        
        // For Mobile Safari: additional check to ensure session is created
        if (isMobileSafari()) {
          // Double check session exists after successful login
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
              console.warn('Mobile Safari: session not found after successful login, forcing auth refresh');
              // Force auth refresh
              setAuthChecks(prev => prev + 1);
            }
          }, 300);
        }
      } else {
        console.error('Login failed');
        
        // Show mobile-specific message
        if (isMobileSafari()) {
          toast({
            title: "Login issue on mobile",
            description: "Please ensure cookies are enabled in your Safari settings",
            variant: "destructive"
          });
        }
      }
      
      return success;
    } catch (error) {
      console.error('Login error:', error);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Logout wrapper with mobile enhancements
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logout();
      setSession(null);
      setUser(null);
      setSupabaseUser(null);
      setIsLoggedIn(false);
      
      // For Mobile Safari: ensure local storage is cleared properly
      if (isMobileSafari()) {
        try {
          // Force clean up any session data that might be left in localStorage
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('supabase.auth.refreshToken');
        } catch (error) {
          console.warn('Error clearing Mobile Safari local storage:', error);
        }
      }
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
