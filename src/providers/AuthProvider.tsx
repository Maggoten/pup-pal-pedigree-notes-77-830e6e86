
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
import { handleAuthStateChange } from '@/utils/reactQueryConfig';

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
  
  const { login, register, logout, getUserProfile } = useAuthActions();

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
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log(`[Auth Debug] Auth state change event: ${event}`);
            
            if (!isSubscribed) return;
            
            // Handle SIGNED_OUT events immediately to prevent flicker
            if (event === 'SIGNED_OUT') {
              if (isSubscribed) {
                setUser(null);
                setSupabaseUser(null);
                setIsLoggedIn(false);
                setSession(null);
                setIsAuthReady(true);
                console.log(`[Auth Debug] Sign out event processed, state cleared`);
                
                // Trigger React Query cleanup on sign out
                handleAuthStateChange(event);
              }
              return;
            }
            
            console.log(`[Auth Debug] Session exists: ${!!currentSession}`);
            if (currentSession) {
              // Immediately update session state to prevent race conditions
              setSession(currentSession);
              setSupabaseUser(currentSession.user);
              setIsLoggedIn(true);
              
              console.log(`[Auth Debug] User ID from session: ${currentSession.user.id}`);
              console.log(`[Auth Debug] Session expires: ${new Date(currentSession.expires_at! * 1000).toISOString()}`);
              
              // Fetch profile in non-blocking way
              setTimeout(async () => {
                try {
                  if (!isSubscribed) return;
                  
                  console.log(`[Auth Debug] Fetching profile for user: ${currentSession.user.id}`);
                  const profile = await getUserProfile(currentSession.user.id);
                  
                  if (profile && isSubscribed) {
                    setUser({
                      id: currentSession.user.id,
                      email: currentSession.user.email || '',
                      firstName: profile.first_name,
                      lastName: profile.last_name,
                      address: profile.address
                    });
                    console.log(`[Auth Debug] User profile loaded`);
                    
                    // Trigger React Query data prefetching on sign in
                    if (event === 'SIGNED_IN') {
                      handleAuthStateChange(event, currentSession.user.id);
                    }
                  } else if (isSubscribed) {
                    // Fallback user
                    setUser({
                      id: currentSession.user.id,
                      email: currentSession.user.email || '',
                      firstName: '',
                      lastName: '',
                      address: ''
                    });
                    console.log(`[Auth Debug] Using fallback user data`);
                    
                    // Still trigger data prefetching with fallback user
                    if (event === 'SIGNED_IN') {
                      handleAuthStateChange(event, currentSession.user.id);
                    }
                  }
                  
                  setIsAuthReady(true);
                } catch (error) {
                  console.error('[Auth Debug] Error fetching profile:', error);
                  setIsAuthReady(true);
                }
              }, 0);
            } else {
              // If no session, set auth ready and clear user
              setUser(null);
              setSupabaseUser(null);
              setIsLoggedIn(false);
              setIsAuthReady(true);
            }
            
            setIsLoading(false);
          }
        );
        
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
          
          if (initialSession?.user && isSubscribed) {
            // Don't set user here to avoid race with auth state change
            // Just ensure isAuthReady is set if the onAuthStateChange doesn't fire
            
            // Safety timeout to ensure isAuthReady gets set
            setTimeout(() => {
              if (isSubscribed && !isAuthReady) {
                console.log('[Auth Debug] Safety timeout triggered, setting isAuthReady');
                setIsAuthReady(true);
                setIsLoading(false);
              }
            }, 3000);
          } else {
            // No session, set auth ready and not loading
            setIsAuthReady(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('[Auth Debug] Error checking initial session:', error);
          setIsAuthReady(true);
          setIsLoading(false);
        }
        
        // Return cleanup function
        return () => {
          subscription.unsubscribe();
          isSubscribed = false;
        };
      } catch (error) {
        console.error('[Auth Debug] Critical error:', error);
        setIsAuthReady(true);
        setIsLoading(false);
      }
    };
    
    initAuth();
    
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
    };
  }, [getUserProfile]);
  
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
