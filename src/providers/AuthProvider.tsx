import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifySession } from '@/utils/storage';
import { RegisterData, User } from '@/types/auth';
import { clearAuthStorage } from '@/services/auth/storageService';
import { toast } from '@/components/ui/use-toast';

// Define SupabaseUser type for internal use
type SupabaseUser = {
  id: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  aud: string;
  created_at: string;
  [key: string]: any;
};

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null; 
  session: Session | null;
  isAuthReady: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  authTransitioning: boolean;
  signIn: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTransitioning, setAuthTransitioning] = useState(false);

  // Helper function to map Supabase user to our User type
  const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || ''
    };
  };

  // Helper to reset all auth state - carefully sequenced for stability
  const resetAuthState = () => {
    console.log("[AuthProvider] Resetting auth state");
    // First set auth as transitioning to prevent premature redirects
    setAuthTransitioning(true);
    
    // Then clear the session and user state
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    setIsLoggedIn(false);
    
    // Allow a brief delay for state to stabilize
    setTimeout(() => {
      setAuthTransitioning(false);
    }, 250); // Short delay to let state updates settle
  };

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        console.log("[AuthProvider] Getting initial session");
        // Get the initial session - critical to break out of "checking authentication" state
        const { data: { session } } = await supabase.auth.getSession();

        setSupabaseUser(session?.user || null);
        setUser(mapSupabaseUser(session?.user || null));
        setSession(session || null);
        setIsLoggedIn(!!session);
        
        // Always set isAuthReady to true even if no session
        setIsAuthReady(true);
        console.log("[AuthProvider] Auth initialized, session exists:", !!session);
      } catch (error) {
        console.error("Failed to get initial session:", error);
        // Important: still mark auth as ready even if there's an error
        setIsAuthReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Start the auth initialization process
    getInitialSession();

    // Subscribe to auth state changes separately from initial session check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthProvider] Auth event: ${event}`);
        
        // Mark that we're in a transitioning state to prevent premature redirects
        setAuthTransitioning(true);
        
        if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] User signed out, resetting state');
          resetAuthState();
        } else {
          setSupabaseUser(session?.user || null);
          setUser(mapSupabaseUser(session?.user || null));
          setSession(session || null);
          setIsLoggedIn(!!session);
        }
        
        // Ensure auth is marked as ready on any auth event
        if (!isAuthReady) setIsAuthReady(true);
        
        // After a short delay, clear the transitioning state to allow redirects
        setTimeout(() => {
          setAuthTransitioning(false);
        }, 250); // Keep this delay short for responsive UX
      }
    );

    // Add a fail-safe timeout to ensure auth state isn't stuck in loading
    const failsafeTimer = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Auth initialization timeout reached - forcing auth ready state");
        setIsAuthReady(true);
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout as fallback

    return () => {
      subscription?.unsubscribe();
      clearTimeout(failsafeTimer);
    };
  }, [isAuthReady]);

  // New method for password-based login to match expected interface
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthTransitioning(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        return false;
      }
      
      return !!data.session;
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      return false;
    } finally {
      setIsLoading(false);
      // Short delay before clearing transitioning state to allow for redirect
      setTimeout(() => {
        setAuthTransitioning(false);
      }, 250);
    }
  };

  // Implementation for the register method
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setAuthTransitioning(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error.message);
        return false;
      }
      
      return !!data.session;
    } catch (error: any) {
      console.error("Unexpected registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
      // Short delay before clearing transitioning state
      setTimeout(() => {
        setAuthTransitioning(false);
      }, 250);
    }
  };

  // Magic link sign-in (keeping original functionality)
  const signIn = async (email: string) => {
    setIsLoading(true);
    setAuthTransitioning(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setAuthTransitioning(false);
      }, 250);
    }
  };

  // Enhanced logout method to match expected interface
  const logout = async (): Promise<void> => {
    return signOut();
  };

  // Enhanced signOut method with better state cleanup
  const signOut = async () => {
    console.log('[AuthProvider] Beginning signOut process');
    setIsLoading(true);
    // First mark that we're in a transition state to prevent premature redirects
    setAuthTransitioning(true);
    
    try {
      // First, clear all auth-related storage items
      // This must happen before resetting state to prevent race conditions
      await clearAuthStorage();
      console.log('[AuthProvider] Auth storage cleared');
      
      // Then reset our internal state - this will trigger UI updates
      resetAuthState();
      
      // Finally, tell Supabase to sign out - this will trigger the onAuthStateChange event
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthProvider] Supabase signOut error:', error);
        toast({
          title: "Sign out issue",
          description: "There was a problem signing out. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('[AuthProvider] Supabase signOut completed successfully');
      }
    } catch (error: any) {
      console.error('[AuthProvider] Error during signOut:', error);
    } finally {
      // Ensure we're not in loading state regardless of the outcome
      setIsLoading(false);
      // Allow a short period for state updates to stabilize
      setTimeout(() => {
        setAuthTransitioning(false);
      }, 300);
    }
  };

  // When using verifySession in this file, update the options to match the new interface
  const checkSession = async () => {
    try {
      const sessionValid = await verifySession({ 
        skipThrow: true,
        authReady: isAuthReady
      });
      if (!sessionValid) {
        console.warn('Potentially invalid session detected, but ignoring.');
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  useEffect(() => {
    if (isAuthReady) {
      checkSession();
    }
  }, [isAuthReady]);

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    isAuthReady,
    isLoading,
    isLoggedIn,
    authTransitioning,
    signIn,
    login,
    logout,
    register,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
