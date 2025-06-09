import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifySession } from '@/utils/storage';
import { RegisterData, User } from '@/types/auth';
import { toast } from 'sonner';

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
  hasAccess: boolean;
  subscriptionStatus: string | null;
  trialEndDate: string | null;
  hasPaid: boolean;
  friend: boolean;
  signIn: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  checkSubscription: () => Promise<void>;
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
  
  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [friend, setFriend] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

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
        
        // Check subscription when user signs in
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(() => {
            // Use setTimeout to avoid calling Supabase within auth state change callback
            checkSubscription();
          }, 100);
        }
        
        // Clear subscription state when user signs out
        if (event === 'SIGNED_OUT') {
          setSubscriptionStatus(null);
          setTrialEndDate(null);
          setHasPaid(false);
          setFriend(false);
          setHasAccess(false);
        }
        
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

  // Logout method to match expected interface
  const logout = async (): Promise<void> => {
    return signOut();
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

  // New method for account deletion
  const deleteAccount = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Get the current session for the auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete your account");
        return false;
      }
      
      // Call the Edge Function with the auth header
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || "https://yqcgqriecxtppuvcguyj.supabase.co"}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (!response.ok || result.error) {
        console.error("Error deleting account:", result);
        toast.error(result.message || "Failed to delete account");
        return false;
      }
      
      // If successful, sign out the user locally
      await signOut();
      
      toast.success("Your account has been successfully deleted");
      return true;
    } catch (error) {
      console.error("Unexpected error during account deletion:", error);
      toast.error("An unexpected error occurred while deleting your account");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate hasAccess based on subscription status
  const calculateAccess = (paid: boolean, isFriend: boolean, status: string | null, endDate: string | null): boolean => {
    // Friend access always takes precedence
    if (isFriend) {
      if (import.meta.env.DEV) {
        console.log('[Auth] Friend access granted');
      }
      return true;
    }
    if (paid) return true;
    if (status === 'trial' && endDate) {
      return new Date(endDate) > new Date();
    }
    return false;
  };

  // Check subscription status
  const checkSubscription = async (): Promise<void> => {
    if (!session) return;
    
    try {
      if (import.meta.env.DEV) {
        console.log('[Auth] Checking subscription for user:', user?.id);
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        // Fallback: check friend status directly from database
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('friend')
            .eq('id', user.id)
            .single();
          
          if (profile?.friend) {
            if (import.meta.env.DEV) {
              console.log('[Auth] Fallback: Friend status found in database');
            }
            setFriend(true);
            setHasAccess(true);
          }
        }
        return;
      }

      if (data) {
        if (import.meta.env.DEV) {
          console.log('[Auth] Subscription check result:', data);
        }
        setSubscriptionStatus(data.subscription_status);
        setTrialEndDate(data.trial_end_date);
        setHasPaid(data.has_paid);
        setFriend(data.is_friend);
        const access = calculateAccess(data.has_paid, data.is_friend, data.subscription_status, data.trial_end_date);
        setHasAccess(access);
        
        if (import.meta.env.DEV) {
          console.log('[Auth] Access granted:', access, { paid: data.has_paid, friend: data.is_friend, status: data.subscription_status });
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
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
    hasAccess,
    subscriptionStatus,
    trialEndDate,
    hasPaid,
    friend,
    signIn,
    login,
    logout,
    register,
    signOut,
    deleteAccount,
    checkSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
