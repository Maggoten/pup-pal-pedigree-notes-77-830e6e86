import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifySession } from '@/utils/storage';
import { RegisterData, User } from '@/types/auth';
import { clearAuthStorage } from '@/services/auth/storageService';

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
  isAuthTransitioning: boolean; // New state to track auth transitions
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
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false); // New transition state

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

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        // Get the initial session - critical to break out of "checking authentication" state
        const { data: { session } } = await supabase.auth.getSession();

        setSupabaseUser(session?.user || null);
        setUser(mapSupabaseUser(session?.user || null));
        setSession(session || null);
        setIsLoggedIn(!!session);
        
        // Always set isAuthReady to true even if no session
        setIsAuthReady(true);
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
        console.log(`Auth event: ${event}`);
        setSupabaseUser(session?.user || null);
        setUser(mapSupabaseUser(session?.user || null));
        setSession(session || null);
        setIsLoggedIn(!!session);
        
        // Ensure auth is marked as ready on any auth event
        if (!isAuthReady) setIsAuthReady(true);
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
    }
  };

  // Implementation for the register method
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
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
    }
  };

  // Magic link sign-in (keeping original functionality)
  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout method with proper transition handling
  const logout = async (): Promise<void> => {
    console.log("AuthProvider: Starting logout process");
    // Set transitioning state to true to prevent AuthGuard from immediately redirecting
    setIsAuthTransitioning(true);
    setIsLoading(true);
    
    try {
      // First clear all storage to ensure complete cleanup
      console.log("AuthProvider: Clearing auth storage");
      await clearAuthStorage();
      
      // Then sign out from Supabase
      console.log("AuthProvider: Calling Supabase signOut");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthProvider: Supabase signOut error:", error);
        throw error;
      }
      
      // Finally, reset all local state even if Supabase call fails
      console.log("AuthProvider: Resetting auth state");
      setSupabaseUser(null);
      setUser(null);
      setSession(null);
      setIsLoggedIn(false);
      
      console.log("AuthProvider: Logout completed successfully");
    } catch (error) {
      console.error("AuthProvider: Error during logout:", error);
    } finally {
      // Small delay before completing transition to allow state updates to settle
      setTimeout(() => {
        setIsLoading(false);
        setIsAuthTransitioning(false);
        console.log("AuthProvider: Auth transition completed");
      }, 300);
    }
  };

  // Legacy method to maintain compatibility
  const signOut = async (): Promise<void> => {
    return logout();
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
    isAuthTransitioning,  // Expose the new transition state
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
