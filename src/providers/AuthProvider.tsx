
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { RegisterData, User, AuthContextType } from '@/types/auth';
import { clearAuthStorage } from '@/services/auth/storageService';
import { toast } from '@/hooks/use-toast';

/**
 * AuthContext provides authentication state and methods throughout the application
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use the auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider component manages authentication state and provides methods
 * for login, logout, and registration
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Basic auth state
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Auth status flags
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * Maps a Supabase user to our application User type
   */
  const mapSupabaseUser = useCallback((supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || ''
    };
  }, []);

  /**
   * Handles login with email and password
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Login successful, redirecting to home page");
      return !!data.session;
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user registration
   */
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
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (!data.session) {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account.",
        });
      }
      
      return !!data.session;
    } catch (error: any) {
      console.error("Unexpected registration error:", error);
      toast({
        title: "Registration failed", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Magic link sign-in (keeping for backward compatibility)
   */
  const signIn = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast({
        title: "Magic link sent",
        description: "Check your email for the magic link to sign in."
      });
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error.message || "Failed to send magic link",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enhanced logout function with aggressive storage cleanup and forced navigation
   */
  const logout = async (): Promise<void> => {
    console.log("Logout initiated...");
    setIsLoading(true);
    
    try {
      // First, call Supabase's signOut method
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signOut error:", error);
        // Continue with cleanup even if Supabase API call fails
      }
      
      // Immediately clear stored user data and auth tokens
      await clearAuthStorage();
      
      // Reset all auth state regardless of API result
      setSession(null);
      setSupabaseUser(null);
      setUser(null);
      setIsLoggedIn(false);
      
      console.log("Logout completed successfully");
      
      // Show success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      // Instead of using useNavigate directly, let the AuthGuard handle redirects
      // AuthGuard will detect the logged out state and redirect appropriately
      
    } catch (error) {
      console.error("Error during logout process:", error);
      toast({
        title: "Logout issue",
        description: "There was a problem during logout. You've been logged out but may need to refresh.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For compatibility with existing code
  const signOut = logout;

  /**
   * Initialize auth state and set up listeners
   */
  useEffect(() => {
    console.log("AuthProvider: Initializing auth state...");
    let authTimeout: ReturnType<typeof setTimeout>;
    
    const initAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log(`Auth event: ${event}`);
          setSupabaseUser(session?.user || null);
          setUser(mapSupabaseUser(session?.user || null));
          setSession(session);
          setIsLoggedIn(!!session);
          
          // Always ensure auth is ready after any auth event
          if (!isAuthReady) setIsAuthReady(true);
        });
        
        // Then get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseUser(session?.user || null);
        setUser(mapSupabaseUser(session?.user || null));
        setSession(session);
        setIsLoggedIn(!!session);
        
        // Mark auth as ready
        setIsAuthReady(true);
        setIsLoading(false);
        
        // Set a timeout to ensure we don't get stuck in a loading state
        authTimeout = setTimeout(() => {
          if (!isAuthReady) {
            console.warn("Auth initialization timeout reached - forcing auth ready state");
            setIsAuthReady(true);
            setIsLoading(false);
          }
        }, 5000);
        
        return () => {
          subscription?.unsubscribe();
          clearTimeout(authTimeout);
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuthReady(true);
        setIsLoading(false);
      }
    };
    
    const cleanup = initAuth();
    return () => {
      cleanup.then(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
      clearTimeout(authTimeout);
    };
  }, [mapSupabaseUser, isAuthReady]);

  // Provide auth context to children
  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    isAuthReady,
    isLoading,
    isLoggedIn,
    login,
    signIn,
    register,
    logout,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
