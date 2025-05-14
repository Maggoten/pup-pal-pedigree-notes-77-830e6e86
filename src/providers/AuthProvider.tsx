import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/storage/core/session';

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
  
  // Function to refresh the session with improved mobile handling
  const refreshSession = useCallback(async () => {
    const platform = getPlatformInfo();
    const isMobile = platform.mobile || platform.safari;
    
    try {
      console.log('[Auth Debug] Refreshing session...');
      
      // Use verifySession with appropriate options
      const sessionValid = await verifySession({
        respectAuthReady: true,
        authReady: isAuthReady,
        skipThrow: true
      });
      
      if (sessionValid) {
        console.log('[Auth Debug] Session verified or refreshed successfully');
        // Get the updated session to update the React state
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setSupabaseUser(data.session.user);
          setIsLoggedIn(true);
        }
        return true;
      } else {
        console.log('[Auth Debug] Session verification failed');
        return false;
      }
    } catch (err) {
      console.error('[Auth Debug] Error during session refresh:', err);
      return false;
    }
  }, [isAuthReady]);

  // Function to check session status across storage locations
  const validateSessionAcrossStorages = useCallback(async () => {
    try {
      // Check localStorage, sessionStorage and cookies for session fragments
      let hasLocalStorageSession = false;
      let hasSessionStorageSession = false;
      
      try {
        // Look for known session keys in localStorage
        hasLocalStorageSession = !!localStorage.getItem('supabase.auth.token') || 
                                !!localStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
      } catch (e) {
        console.log('[Auth Debug] Error checking localStorage:', e);
      }
      
      try {
        // Look for known session keys in sessionStorage
        hasSessionStorageSession = !!sessionStorage.getItem('supabase.auth.token') || 
                                   !!sessionStorage.getItem('sb-yqcgqriecxtppuvcguyj-auth-token');
      } catch (e) {
        console.log('[Auth Debug] Error checking sessionStorage:', e);
      }
      
      // If session found in any storage but getSession returns no session, 
      // there might be a storage fragmentation issue
      const { data } = await supabase.auth.getSession();
      if ((hasLocalStorageSession || hasSessionStorageSession) && !data.session) {
        console.log('[Auth Debug] Storage fragmentation detected: session in storage but not in memory');
        
        // Try to fix by forcing a recovery refresh
        const { data: refreshData } = await supabase.auth.refreshSession();
        return !!refreshData.session;
      }
      
      return !!data.session;
    } catch (e) {
      console.error('[Auth Debug] Error during cross-storage validation:', e);
      return false;
    }
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
          
          // First validate session across storage locations (important for Safari)
          const hasValidSession = await validateSessionAcrossStorages();
          
          if (!hasValidSession) {
            console.log('[Auth Debug] No valid session found, attempting refresh...');
          }
          
          // Refresh regardless to ensure tokens are up to date
          await refreshSession();
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
  }, [refreshSession, validateSessionAcrossStorages, isAuthReady]);
  
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
            
            if (event === 'INITIAL_SESSION') {
              console.log('[Auth Debug] Initial session event received');
            }
            
            console.log(`[Auth Debug] Session exists: ${!!currentSession}`);
            if (currentSession) {
              console.log(`[Auth Debug] User ID from session: ${currentSession.user.id}`);
              console.log(`[Auth Debug] Session expires: ${new Date(currentSession.expires_at! * 1000).toISOString()}`);
            }
            
            setSession(currentSession);
            setIsLoggedIn(!!currentSession);
            
            if (currentSession?.user) {
              console.log(`[Auth Debug] User authenticated: ${currentSession.user.id}`);
              setSupabaseUser(currentSession.user);
              
              // Use setTimeout to prevent potential deadlocks - this is critical for mobile
              setTimeout(async () => {
                try {
                  if (!isSubscribed) return;
                  
                  console.log(`[Auth Debug] Fetching profile for user: ${currentSession.user.id}`);
                  // Get user profile from database with retry logic
                  let retryCount = 0;
                  let profile = null;
                  
                  while (retryCount < 4 && !profile) {
                    try {
                      profile = await getUserProfile(currentSession.user.id);
                      if (profile) {
                        console.log(`[Auth Debug] Profile retrieved: success`);
                        break;
                      }
                      console.log(`[Auth Debug] Profile fetch attempt ${retryCount + 1} returned null`);
                    } catch (err) {
                      console.log(`[Auth Debug] Profile fetch attempt ${retryCount + 1} failed:`, err);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                    retryCount++;
                  }
                  
                  if (profile) {
                    setUser({
                      id: currentSession.user.id,
                      email: currentSession.user.email || '',
                      firstName: profile.first_name,
                      lastName: profile.last_name,
                      address: profile.address
                    });
                    console.log(`[Auth Debug] User object set with profile data`);
                  } else {
                    console.error('[Auth Debug] Failed to fetch profile after retries');
                    // Use a fallback approach - create a minimal user object
                    setUser({
                      id: currentSession.user.id,
                      email: currentSession.user.email || '',
                      firstName: '',
                      lastName: '',
                      address: ''
                    });
                    console.log(`[Auth Debug] User object set with fallback data`);
                  }
                  // IMPORTANT: Only set auth as ready AFTER setting the user
                  setIsAuthReady(true);
                } catch (error) {
                  console.error('[Auth Debug] Error in auth state change handler:', error);
                  setIsAuthReady(true); // Mark as ready even on error to prevent hanging
                }
              }, 0);
            } else {
              if (event === 'SIGNED_OUT') {
                if (isSubscribed) {
                  setUser(null);
                  setSupabaseUser(null);
                  setIsLoggedIn(false);
                  console.log(`[Auth Debug] Sign out event processed, state cleared`);
                  
                  // Perform thorough storage cleanup
                  try {
                    // ... keep existing code (storage cleanup)
                  } catch (e) {
                    console.log('[Auth Debug] Error during thorough storage cleanup:', e);
                  }
                  
                  // Explicit mark as auth ready on signout
                  setIsAuthReady(true);
                }
              } else {
                // If we have no session and it's not a signout event,
                // mark as not logged in and auth ready
                setUser(null);
                setSupabaseUser(null);
                setIsAuthReady(true);
                console.log(`[Auth Debug] No user in session, marked auth as ready`);
              }
            }

            setIsLoading(false);
          }
        );

        // Check for existing session with enhanced mobile handling
        try {
          // Enhanced session check with retry and cross-storage validation
          const getInitialSession = async () => {
            const platform = getPlatformInfo();
            const isMobile = platform.mobile || platform.safari;
            
            console.log(`[Auth Debug] Checking initial session on ${platform.device}`);
            
            // First check standard session with more retries for mobile
            const { data: { session: initialSession }, error } = await fetchWithRetry(
              () => supabase.auth.getSession(),
              { 
                maxRetries: isMobile ? 4 : 3, 
                initialDelay: isMobile ? 1800 : 1500,
                useBackoff: true
              }
            );
            
            if (error) {
              console.log('[Auth Debug] Error getting session:', error);
              
              // Try cross-storage validation for Safari
              if (platform.safari || platform.mobile) {
                console.log(`[Auth Debug] ${platform.device} detected, trying cross-storage validation`);
                await validateSessionAcrossStorages();
                
                // After validation attempt, try session refresh
                console.log('[Auth Debug] Attempting session refresh after validation');
                const refreshResult = await supabase.auth.refreshSession();
                return refreshResult.data.session;
              }
              
              return null;
            }
            
            return initialSession;
          };
          
          const initialSession = await getInitialSession();
          
          console.log(`[Auth Debug] Initial session check: ${initialSession ? 'Session exists' : 'No session'}`);
          
          if (initialSession?.user && isSubscribed) {
            console.log(`[Auth Debug] Initial user ID: ${initialSession?.user?.id || 'none'}`);
            
            setSession(initialSession);
            setSupabaseUser(initialSession.user);
            setIsLoggedIn(true);
            
            if (initialSession.access_token) {
              console.log(`[Auth Debug] Initial auth token length: ${initialSession.access_token.length}`);
              const expiresAt = initialSession.expires_at;
              if (expiresAt) {
                const expiryDate = new Date(expiresAt * 1000);
                console.log(`[Auth Debug] Token expires at: ${expiryDate.toISOString()}`);
              }
            } else {
              console.warn('[Auth Debug] No access token in session');
            }
            
            // Get user profile from database with retry logic
            let retryCount = 0;
            let profile = null;
            
            while (retryCount < 4 && !profile) {
              try {
                console.log(`[Auth Debug] Initial profile fetch attempt ${retryCount + 1}`);
                profile = await getUserProfile(initialSession.user.id);
                if (profile) break;
              } catch (err) {
                console.log(`[Auth Debug] Initial profile fetch attempt ${retryCount + 1} failed:`, err);
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
              retryCount++;
            }
            
            if (profile && isSubscribed) {
              setUser({
                id: initialSession.user.id,
                email: initialSession.user.email || '',
                firstName: profile.first_name,
                lastName: profile.last_name,
                address: profile.address
              });
            } else if (isSubscribed) {
              // Create a minimal user object as fallback
              setUser({
                id: initialSession.user.id,
                email: initialSession.user.email || '',
                firstName: '',
                lastName: '',
                address: ''
              });
            }
          }
          
          // Always mark auth as ready and loading complete even if no session
          // IMPORTANT: This needs to happen AFTER the profile is loaded and user is set
          setIsAuthReady(true);
          setIsLoading(false);
          
        } catch (sessionError) {
          console.error('[Auth Debug] Error checking initial session:', sessionError);
          // Even on error, mark auth as ready and loading complete to prevent hanging
          setIsAuthReady(true);
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
          isSubscribed = false;
        };
      } catch (err) {
        console.error('[Auth Debug] Critical error during auth setup:', err);
        setIsAuthReady(true);
        setIsLoading(false);
      }
    };

    initAuth();
    
    // Add a safety timeout in case auth never completes
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('[Auth Debug] Auth initialization timed out, forcing ready state');
        setIsLoading(false);
        setIsAuthReady(true);
      }
    }, 8000); // Reduced from 10s to 8s for faster recovery
    
    // Safari may need periodic session refreshes to maintain authentication
    let refreshTimer: NodeJS.Timeout | null = null;
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      refreshTimer = setInterval(async () => {
        // Only run Safari periodic refresh if auth is ready
        if (isAuthReady) {
          try {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              console.log('[Auth Debug] Safari periodic session refresh');
              await supabase.auth.refreshSession();
            }
          } catch (e) {
            console.error('[Auth Debug] Error in periodic session refresh:', e);
          }
        }
      }, 3 * 60 * 1000); // Every 3 minutes
    }
    
    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [getUserProfile, validateSessionAcrossStorages]);

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
