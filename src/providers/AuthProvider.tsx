
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifySession } from '@/utils/storage';
import { RegisterData, User } from '@/types/auth';
import { clearAuthStorage, verifyAuthStorageClear } from '@/services/auth/storageService';

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
  isAuthTransitioning: boolean; 
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
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [logoutCompletionState, setLogoutCompletionState] = useState(false);
  
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

        console.log('[AuthProvider] Initial auth session check:', 
          session ? 'Session found' : 'No session');
          
        setSupabaseUser(session?.user || null);
        setUser(mapSupabaseUser(session?.user || null));
        setSession(session || null);
        setIsLoggedIn(!!session);
        
        // Always set isAuthReady to true even if no session
        setIsAuthReady(true);
      } catch (error) {
        console.error("[AuthProvider] Failed to get initial session:", error);
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
        console.log(`[AuthProvider] Auth event: ${event}`, 
          session ? 'Session exists' : 'No session');
          
        setSupabaseUser(session?.user || null);
        setUser(mapSupabaseUser(session?.user || null));
        setSession(session || null);
        setIsLoggedIn(!!session);
        
        // Ensure auth is marked as ready on any auth event
        if (!isAuthReady) setIsAuthReady(true);
        
        // NEW: If logout detected, ensure we complete state transition properly
        if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] SIGNED_OUT event detected, ensuring cleanup');
          // Add small delay to ensure state updates properly
          setTimeout(() => {
            setIsAuthTransitioning(false);
          }, 300);
        }
      }
    );

    // Add a fail-safe timeout to ensure auth state isn't stuck in loading
    const failsafeTimer = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("[AuthProvider] Auth initialization timeout reached - forcing auth ready state");
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
        console.error("[AuthProvider] Login error:", error.message);
        return false;
      }
      
      return !!data.session;
    } catch (error: any) {
      console.error("[AuthProvider] Unexpected login error:", error);
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
        console.error("[AuthProvider] Registration error:", error.message);
        return false;
      }
      
      return !!data.session;
    } catch (error: any) {
      console.error("[AuthProvider] Unexpected registration error:", error);
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

  // Further enhanced logout method with proper transition handling, verification and extended delays
  const logout = async (): Promise<void> => {
    console.log("[AuthProvider] Starting logout process");
    
    // First set transition state to prevent premature redirects
    setIsAuthTransitioning(true);
    setLogoutCompletionState(false);
    
    // Also set loading state
    setIsLoading(true);
    
    try {
      // Step 1: Clear all storage to ensure complete cleanup
      console.log("[AuthProvider] Clearing auth storage");
      await clearAuthStorage();
      
      // Step 2: Reset all local state BEFORE Supabase signOut to avoid race conditions
      console.log("[AuthProvider] Resetting local auth state");
      setSupabaseUser(null);
      setUser(null);
      setSession(null);
      setIsLoggedIn(false);
      
      // Step 3: Sign out from Supabase
      console.log("[AuthProvider] Calling Supabase signOut");
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Explicitly sign out from all tabs/devices
      });
      
      if (error) {
        console.error("[AuthProvider] Supabase signOut error:", error);
        throw error;
      }
      
      // Step 4: Verify sign out was successful with a second check
      console.log("[AuthProvider] Verifying successful logout");
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        console.warn("[AuthProvider] Session still exists after logout attempt");
      } else {
        console.log("[AuthProvider] Logout confirmed - no session exists");
      }
      
      // Step 5: NEW - Verify storage cleanup was complete
      const storageCleanupComplete = verifyAuthStorageClear();
      console.log("[AuthProvider] Storage cleanup verification:", 
        storageCleanupComplete ? "Complete" : "Incomplete");
      
      // Step 6: Force a second storage cleanup if needed
      if (!storageCleanupComplete) {
        console.log("[AuthProvider] Performing secondary storage cleanup");
        await clearAuthStorage();
      }
      
      console.log("[AuthProvider] Logout completed successfully");
      setLogoutCompletionState(true);
    } catch (error) {
      console.error("[AuthProvider] Error during logout:", error);
    } finally {
      // NEW: Increased delay before completing transition to allow state updates to settle
      // Increased from 800ms to 1000ms
      console.log("[AuthProvider] Setting final state after 1000ms delay");
      setTimeout(() => {
        // Double-check auth state once more before finalizing
        console.log("[AuthProvider] Final auth state verification");
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            console.warn("[AuthProvider] WARNING: Session still exists after logout!");
          } else {
            console.log("[AuthProvider] Final verification confirms no session exists");
          }
          
          // Complete the transition regardless
          setIsLoading(false);
          setIsAuthTransitioning(false);
          console.log("[AuthProvider] Auth transition completed", {
            user: null,
            isLoggedIn: false,
            isAuthTransitioning: false
          });
        });
      }, 1000); // Increased from 800ms to 1000ms
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
        console.warn('[AuthProvider] Potentially invalid session detected, but ignoring.');
      }
    } catch (error) {
      console.error('[AuthProvider] Session check error:', error);
    }
  };

  useEffect(() => {
    if (isAuthReady) {
      checkSession();
    }
  }, [isAuthReady]);
  
  // Debug logging effect to track state changes
  useEffect(() => {
    console.log('[AuthProvider] Auth state update:', {
      user: user ? 'exists' : 'null',
      isLoggedIn,
      isAuthReady,
      isAuthTransitioning
    });
  }, [user, isLoggedIn, isAuthReady, isAuthTransitioning]);

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    isAuthReady,
    isLoading,
    isLoggedIn,
    isAuthTransitioning,
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
