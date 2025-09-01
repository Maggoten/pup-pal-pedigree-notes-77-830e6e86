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
  isLoggingOut: boolean;
  hasAccess: boolean | null;
  accessCheckComplete: boolean;
  isAccessChecking: boolean;
  subscriptionStatus: string | null;
  trialEndDate: string | null;
  currentPeriodEnd: string | null;
  hasPaid: boolean;
  friend: boolean;
  subscriptionLoading: boolean;
  signIn: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [friend, setFriend] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = not checked yet, false = no access, true = has access
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);
  const [isAccessChecking, setIsAccessChecking] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

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
        
        // FORCE subscription check on initial load if user is already logged in
        if (session) {
          if (import.meta.env.DEV) {
            console.log('[Auth] User already logged in on app load - forcing subscription check');
          }
          setTimeout(() => {
            // Use setTimeout to avoid calling during auth initialization
            checkSubscription();
          }, 500);
        } else {
          // CRITICAL: If no session, mark access check as complete to prevent modal flash
          setAccessCheckComplete(true);
          setSubscriptionLoading(false);
          setHasAccess(null); // Explicitly null for no session state
        }
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
          setCurrentPeriodEnd(null);
          setHasPaid(false);
          setFriend(false);
          setHasAccess(null); // null instead of false to prevent modal flash
          setAccessCheckComplete(true); // Complete the check for signed out state
          setIsAccessChecking(false); // Clear access checking state
          setSubscriptionLoading(false);
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

  // Enhanced logout method with state management (NO navigation)
  const logout = async (): Promise<void> => {
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      // Only show error if it's not a missing session error
      if (error && !error.message?.includes('session_not_found') && !error.message?.includes('Session not found')) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out properly");
        return;
      }
      
      // Navigation will be handled by AuthGuard when it detects auth state change
      
    } catch (error: any) {
      console.error("Sign out error:", error);
      if (!error.message?.includes('session_not_found') && !error.message?.includes('Session not found')) {
        toast.error("An error occurred during sign out");
      }
    } finally {
      // Always reset logout state, even on error
      setIsLoggingOut(false);
      
      // Add timeout fallback to ensure state is reset
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 2000);
    }
  };

  // Enhanced signOut method with state management (NO navigation)
  const signOut = async () => {
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      // Only show error if it's not a missing session error
      if (error && !error.message?.includes('session_not_found') && !error.message?.includes('Session not found')) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out properly");
        return;
      }
      
      // Navigation will be handled by AuthGuard when it detects auth state change
      
    } catch (error: any) {
      console.error("Sign out error:", error);
      if (!error.message?.includes('session_not_found') && !error.message?.includes('Session not found')) {
        toast.error("An error occurred during sign out");
      }
    } finally {
      // Always reset logout state, even on error
      setIsLoggingOut(false);
      
      // Add timeout fallback to ensure state is reset
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 2000);
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

  // Update password method
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user?.email) {
      toast.error("You must be logged in to update your password");
      return false;
    }

    setIsLoading(true);
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return false;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        toast.error("Failed to update password. Please try again.");
        return false;
      }

      // Refresh the session to ensure the user stays logged in with updated credentials
      const { data: { session: refreshedSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session refresh error after password update:", sessionError);
        // Still return true since password was updated successfully
      } else if (refreshedSession) {
        // Update the session and user state with fresh data
        setSession(refreshedSession);
        setSupabaseUser(refreshedSession.user);
        setUser(mapSupabaseUser(refreshedSession.user));
        if (import.meta.env.DEV) {
          console.log("Session refreshed successfully after password update");
        }
      }

      return true;
    } catch (error) {
      console.error("Unexpected error during password update:", error);
      toast.error("An unexpected error occurred while updating your password");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sequential access control flow as specified by user
  const calculateSequentialAccess = (paid: boolean, isFriend: boolean, status: string | null, endDate: string | null): boolean => {
    const timestamp = new Date().toISOString();
    
    if (import.meta.env.DEV) {
      console.log(`[Auth] ${timestamp} - Starting sequential access check:`, {
        isFriend,
        status,
        endDate,
        paid
      });
    }

    // Step 1: Check if user is marked as a friend
    if (isFriend) {
      if (import.meta.env.DEV) {
        console.log(`[Auth] ${timestamp} - STEP 1: Friend status found - granting immediate access`);
      }
      return true;
    }

    // Step 2: Check if user's free trial is active
    if (status === 'trial' && endDate) {
      const isTrialActive = new Date(endDate) > new Date();
      if (isTrialActive) {
        if (import.meta.env.DEV) {
          console.log(`[Auth] ${timestamp} - STEP 2: Active trial found - granting access`);
        }
        return true;
      }
    }

    // Step 3: Check if user has an active paying membership
    if (paid) {
      if (import.meta.env.DEV) {
        console.log(`[Auth] ${timestamp} - STEP 3: Paid membership found - granting access`);
      }
      return true;
    }

    // Step 4: No access conditions met - blocking modal should be shown
    if (import.meta.env.DEV) {
      console.log(`[Auth] ${timestamp} - STEP 4: No access conditions met - denying access`);
    }
    return false;
  };

  // Check subscription status with enhanced debugging and fallback
  const checkSubscription = async (): Promise<void> => {
    if (!session) {
      if (import.meta.env.DEV) {
        console.log('[Auth] No session available for subscription check');
      }
      return;
    }
    
    // Set access checking state immediately when starting the check
    setIsAccessChecking(true);
    setSubscriptionLoading(true);
    const timestamp = new Date().toISOString();
    
    try {
      if (import.meta.env.DEV) {
        console.log(`[Auth] ${timestamp} - Starting subscription check for user:`, user?.id);
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error(`[Auth] ${timestamp} - Edge function error:`, error);
        
        // IMMEDIATE FALLBACK: Check friend status directly from database
        if (user?.id) {
          if (import.meta.env.DEV) {
            console.log(`[Auth] ${timestamp} - Using fallback: querying profiles table directly`);
          }
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('friend, has_paid, subscription_status, trial_end_date')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error(`[Auth] ${timestamp} - Fallback query failed:`, profileError);
            return;
          }
          
          if (profile) {
            if (import.meta.env.DEV) {
              console.log(`[Auth] ${timestamp} - Fallback profile data:`, profile);
            }
            
            // Apply friend status immediately if found
            if (profile.friend) {
              if (import.meta.env.DEV) {
                console.log(`[Auth] ${timestamp} - FALLBACK: Friend status found, granting immediate access`);
              }
              setFriend(true);
              setHasAccess(true);
              setSubscriptionStatus('friend');
              setHasPaid(profile.has_paid || false);
              setTrialEndDate(profile.trial_end_date);
              return;
            }
            
            // Apply other subscription data
            setFriend(false);
            setHasPaid(profile.has_paid || false);
            setSubscriptionStatus(profile.subscription_status || 'inactive');
            setTrialEndDate(profile.trial_end_date);
            const access = calculateSequentialAccess(profile.has_paid || false, false, profile.subscription_status || 'inactive', profile.trial_end_date);
            setHasAccess(access);
          }
        }
        return;
      }

      if (data) {
        if (import.meta.env.DEV) {
          console.log(`[Auth] ${timestamp} - Edge function success:`, data);
        }
        
        setSubscriptionStatus(data.subscription_status);
        setTrialEndDate(data.trial_end_date);
        setCurrentPeriodEnd(data.current_period_end);
        setHasPaid(data.has_paid);
        setFriend(data.is_friend);
        
        const access = calculateSequentialAccess(data.has_paid, data.is_friend, data.subscription_status, data.trial_end_date);
        setHasAccess(access);
        
        if (import.meta.env.DEV) {
          console.log(`[Auth] ${timestamp} - Final access state:`, {
            hasAccess: access,
            friend: data.is_friend,
            hasPaid: data.has_paid,
            subscriptionStatus: data.subscription_status,
            trialEndDate: data.trial_end_date
          });
        }
      }
    } catch (error) {
      console.error(`[Auth] ${timestamp} - Unexpected error:`, error);
      
      // Emergency fallback for unexpected errors
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('friend')
            .eq('id', user.id)
            .single();
          
          if (profile?.friend) {
            if (import.meta.env.DEV) {
              console.log(`[Auth] ${timestamp} - Emergency fallback: Friend access granted`);
            }
            setFriend(true);
            setHasAccess(true);
          }
        } catch (fallbackError) {
          console.error(`[Auth] ${timestamp} - Emergency fallback failed:`, fallbackError);
        }
      }
    } finally {
      setSubscriptionLoading(false);
      setAccessCheckComplete(true);
      setIsAccessChecking(false);
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
    isLoggingOut,
    hasAccess,
    accessCheckComplete,
    isAccessChecking,
    subscriptionStatus,
    trialEndDate,
    currentPeriodEnd,
    hasPaid,
    friend,
    subscriptionLoading,
    signIn,
    login,
    logout,
    register,
    signOut,
    deleteAccount,
    updatePassword,
    checkSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
