
import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession, refreshSession, clearSessionState } from '@/utils/auth/sessionManager';
import { handleAuthStateChange, resetQueryClient } from '@/utils/reactQueryConfig';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Track focus & visibility state
  const [isActive, setIsActive] = useState(true);
  const lastActiveTime = useRef(Date.now());
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { login, register, logout: baseLogout, getUserProfile } = useAuthActions();

  /**
   * Fetches user profile and maps it to our app user shape
   * Handles missing profile data with sensible defaults
   */
  const fetchAndMapUserProfile = async (
    userId: string, 
    userEmail?: string | null
  ): Promise<User | null> => {
    if (!userId) return null;
    
    try {
      console.log(`[Auth Debug] Fetching profile for user: ${userId}`);
      const profile = await getUserProfile(userId);
      
      if (profile) {
        return {
          id: userId,
          email: userEmail || '',
          firstName: profile.first_name,
          lastName: profile.last_name,
          address: profile.address
        };
      } else {
        // Fallback user when profile fetch returns no data
        console.log(`[Auth Debug] Using fallback user data (no profile found)`);
        return {
          id: userId,
          email: userEmail || '',
          firstName: '',
          lastName: '',
          address: ''
        };
      }
    } catch (error) {
      console.error('[Auth Debug] Error fetching profile:', error);
      
      // Fallback user on error
      return {
        id: userId,
        email: userEmail || '',
        firstName: '',
        lastName: '',
        address: ''
      };
    }
  };

  /**
   * Shared helper function to process authentication changes
   * Handles all session state updates and user profile fetching
   */
  const processAuthChange = useCallback(async (
    event: string,
    currentSession: Session | null,
    options?: { skipProfileFetch?: boolean }
  ) => {
    if (!currentSession) {
      // No session, clear user state
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      setIsLoggedIn(false);
      setIsAuthReady(true);
      setIsLoading(false);
      
      // Trigger React Query cleanup on sign out if needed
      if (event === 'SIGNED_OUT') {
        handleAuthStateChange(event);
      }
      
      return;
    }
    
    // Immediately update session state to prevent race conditions
    setSession(currentSession);
    setSupabaseUser(currentSession.user);
    setIsLoggedIn(true);
    
    console.log(`[Auth Debug] User ID from session: ${currentSession.user.id}`);
    console.log(`[Auth Debug] Session expires: ${new Date(currentSession.expires_at! * 1000).toISOString()}`);
    
    // Skip profile fetch if requested (useful for certain events)
    if (options?.skipProfileFetch) {
      setIsAuthReady(true);
      setIsLoading(false);
      return;
    }
    
    try {
      // Fetch user profile
      const appUser = await fetchAndMapUserProfile(
        currentSession.user.id, 
        currentSession.user.email
      );
      
      if (appUser) {
        setUser(appUser);
        console.log(`[Auth Debug] User profile loaded`);
        
        // Trigger React Query data prefetching on sign in
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          handleAuthStateChange('SIGNED_IN', currentSession.user.id);
        } else if (event === 'REFRESHED') {
          handleAuthStateChange(event, currentSession.user.id);
        }
      }
    } catch (error) {
      console.error('[Auth Debug] Error processing auth change:', error);
    } finally {
      // Ensure auth is ready and loading is complete regardless of profile fetch result
      setIsAuthReady(true);
      setIsLoading(false);
    }
  }, [fetchAndMapUserProfile]);
  
  // Helper to check if a session is expired or near expiration
  const isSessionExpiredOrNearExpiry = useCallback((currentSession: Session | null, options?: { ignoreAuthReady?: boolean }): boolean => {
    // Do not perform expiry checks until auth is ready, unless explicitly overridden
    if (!options?.ignoreAuthReady && !isAuthReady) {
      console.log('[Auth Debug] Skipping expiry check as auth is not ready yet');
      return false;
    }
    
    if (!currentSession || !currentSession.expires_at) return true;
    
    // Convert expires_at to milliseconds
    const expiryTime = currentSession.expires_at * 1000;
    const now = Date.now();
    
    // Check if expired or within 5 minutes of expiry
    const fiveMinutesMs = 5 * 60 * 1000;
    const isExpiring = now >= expiryTime - fiveMinutesMs;
    
    if (isExpiring) {
      console.log('[Auth Debug] Session is expired or near expiry', {
        now: new Date(now).toISOString(),
        expiry: new Date(expiryTime).toISOString(),
        timeLeft: (expiryTime - now) / 1000 / 60 + ' minutes'
      });
    }
    
    return isExpiring;
  }, [isAuthReady]);

  // Log device info immediately
  useEffect(() => {
    const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
    const browserType = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 
                        navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other';
    console.log(`[Auth Debug] Device type: ${deviceType}, Browser: ${browserType}, User Agent: ${navigator.userAgent}`);
    
    // Clean up any lingering state from previous sessions
    clearSessionState();
    
    // Return cleanup function
    return () => {
      clearSessionState();
    };
  }, []);
  
  // Handle window focus/blur events (tab switching)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const isNowVisible = document.visibilityState === 'visible';
      setIsActive(isNowVisible);
      
      if (isNowVisible) {
        const now = Date.now();
        const inactiveTime = now - lastActiveTime.current;
        lastActiveTime.current = now;
        
        console.log(`[Auth Debug] App returned to foreground after ${Math.round(inactiveTime / 1000)}s`);
        
        // Only attempt refresh if auth is ready
        if (isAuthReady && inactiveTime > 30 * 1000) {
          console.log('[Auth Debug] Long inactivity detected, refreshing session...');
          
          // Refresh session
          const refreshed = await refreshSession();
          
          if (refreshed && session && supabaseUser) {
            // Trigger data refresh upon successful session refresh
            handleAuthStateChange('REFRESHED', supabaseUser.id);
          }
        }
      } else {
        // Going inactive - record time
        lastActiveTime.current = Date.now();
      }
    };
    
    // On first load
    handleVisibilityChange();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // For Safari, also listen to focus/blur events
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', () => setIsActive(false));
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', () => {});
    };
  }, [refreshSession, isAuthReady, session, supabaseUser]);
  
  // Periodically check session when app is active
  useEffect(() => {
    // Clear any existing interval
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
    
    // Only set up interval when app is active and we have a session
    // AND auth is ready
    if (isActive && session && isAuthReady) {
      // Check session more frequently on Safari
      const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
      const interval = isSafari ? 2 * 60 * 1000 : 4 * 60 * 1000; // 2 min for Safari, 4 min otherwise
      
      sessionCheckInterval.current = setInterval(async () => {
        console.log(`[Auth Debug] Periodic session check (${isSafari ? 'Safari' : 'Standard'} interval)`);
        
        if (isSessionExpiredOrNearExpiry(session)) {
          console.log('[Auth Debug] Session is expired or near expiry, refreshing...');
          await refreshSession();
        }
      }, interval);
    }
    
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
    };
  }, [isActive, session, refreshSession, isSessionExpiredOrNearExpiry, isAuthReady]);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isSubscribed = true;
    
    const initAuth = async () => {
      try {
        // First set up the auth state listener - STORE THE SUBSCRIPTION PROPERLY
        const authStateResponse = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log(`[Auth Debug] Auth state change event: ${event}`);
            
            if (!isSubscribed) return;
            
            // Handle SIGNED_OUT events immediately to prevent flicker
            if (event === 'SIGNED_OUT') {
              processAuthChange(event, null);
              return;
            }
            
            // Process other auth events
            processAuthChange(event, currentSession);
          }
        );
        
        // Store the subscription for proper cleanup
        const subscription = authStateResponse.data.subscription;
        
        // Check for existing session
        try {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[Auth Debug] Error getting initial session:', error);
            setIsAuthReady(true);
            setIsLoading(false);
            return;
          }
          
          console.log(`[Auth Debug] Initial session check: ${initialSession ? 'Session exists' : 'No session'}`);
          
          // Process the initial session with appropriate event name
          if (isSubscribed) {
            await processAuthChange('INITIAL_SESSION', initialSession);
          }
        } catch (error) {
          console.error('[Auth Debug] Error checking initial session:', error);
          setIsAuthReady(true);
          setIsLoading(false);
        }
        
        // Return cleanup function
        return () => {
          console.log('[Auth Debug] Unsubscribing from auth state changes');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[Auth Debug] Critical error:', error);
        setIsAuthReady(true);
        setIsLoading(false);
      }
    };
    
    const cleanupPromise = initAuth();
    
    // Safety timeout to prevent hanging
    const safetyTimer = setTimeout(() => {
      if (isSubscribed && (isLoading || !isAuthReady)) {
        console.warn('[Auth Debug] Auth initialization timed out, forcing ready state');
        setIsLoading(false);
        setIsAuthReady(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(safetyTimer);
      isSubscribed = false;
      
      // Ensure we call the cleanup function returned by initAuth
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [getUserProfile, processAuthChange]);
  
  /**
   * Enhanced logout function that properly resets all application state
   * to ensure consistent UI behavior after logout
   */
  const wrappedLogout = useCallback(async () => {
    console.log('[Auth Debug] Enhanced logout starting - clearing all auth state');
    
    // Clear query cache before logout
    resetQueryClient();
    
    try {
      // First, clear any active session check intervals
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      
      // Call the base logout function from useAuthActions
      await baseLogout();
      
      // Clear session state in the central manager
      clearSessionState();
      
      // Force reset all auth-related React state immediately
      // This ensures the UI is updated right away
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      setIsAuthReady(true);
      
      // Explicitly trigger the auth state change handler
      handleAuthStateChange('SIGNED_OUT');
      
      console.log('[Auth Debug] Enhanced logout complete - all auth state cleared');
      
      toast({
        title: 'Logout successful',
        description: 'You have been logged out successfully.',
      });
      
    } catch (error) {
      console.error('[Auth Debug] Error during enhanced logout:', error);
      
      // Even if the logout fails at the API level, reset UI state
      // to prevent user confusion
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      setIsLoggedIn(false);
      
      toast({
        title: 'Logout problem',
        description: 'There was an issue during logout. Please try again.',
        variant: 'destructive',
      });
    }
  }, [baseLogout]);
  
  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading: isLoading,
        isLoading,
        isLoggedIn,
        isAuthReady,
        login,
        register,
        logout: wrappedLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
