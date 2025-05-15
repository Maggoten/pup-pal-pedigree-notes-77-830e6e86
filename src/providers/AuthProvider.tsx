
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifySession } from '@/utils/storage';

// Define User type directly since we're not importing from auth-helpers-react
type User = {
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
  session: Session | null;
  isAuthReady: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  signIn: (email: string) => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        // Get the initial session - critical to break out of "checking authentication" state
        const { data: { session } } = await supabase.auth.getSession();

        setUser(session?.user || null);
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
        setUser(session?.user || null);
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

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
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
    session,
    isAuthReady,
    isLoading,
    isLoggedIn,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
