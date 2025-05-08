
import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User } from '@/types/auth';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useAuthActions } from '@/hooks/useAuthActions';
import AuthContext from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';

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
  const isSessionExpiredOrNearExpiry = useCallback((currentSession: Session | null): boolean => {
    if (!currentSession || !currentSession.expires_at) return true;
    
    // Convert expires_at to milliseconds
    const expiryTime = currentSession.expires_at * 1000;
    const now = Date.now();
    
    // Check if expired or within 5 minutes of expiry
    const fiveMinutesMs = 5 * 60 * 1000;
    return now >= expiryTime - fiveMinutesMs;
  }, []);
  
  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      console.log('[Auth Debug] Refreshing session...');
      
      // Check for existing session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[Auth Debug] Error getting session during refresh:', sessionError);
        return false;
      }
      
      if (!sessionData.session) {
        console.log('[Auth Debug] No session to refresh');
        return false;
      }
      
      // Only refresh if needed
      if (isSessionExpiredOrNearExpiry(sessionData.session)) {
        console.log('[Auth Debug] Session needs refresh, refreshing...');
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('[Auth Debug] Session refresh failed:', error);
          return false;
        }
        
        if (data?.session) {
          console.log('[Auth Debug] Session refreshed successfully');
          return true;
        }
      } else {
        console.log('[Auth Debug] Session still valid, no refresh needed');
        return true;
      }
    } catch (err) {
      console.error('[Auth Debug] Error during session refresh:', err);
      return false;
    }
    
    return false;
  }, [isSessionExpiredOrNearExpiry]);
  
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
        
        // If inactive for more than 30 seconds, refresh session
        if (inactiveTime > 30 * 1000) {
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
  }, [refreshSession, validateSessionAcrossStorages]);
  
  // Periodically check session when app is active
  useEffect(() => {
    // Clear any existing interval
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
    
    // Only set up interval when app is active and we have a session
    if (isActive && session) {
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
  }, [isActive, session, refreshSession, isSessionExpiredOrNearExpiry]);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    let isSubscribed = true;
    
    const initAuth = async () => {
      try {
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log(`[Auth Debug] Auth state change event: ${event}`);
            console.log(`[Auth Debug] Session exists: ${!!currentSession}`);
            console.log(`[Auth Debug] User ID from session: ${currentSession?.user?.id || 'none'}`);
            
            if (!isSubscribed) return;
            
            setSession(currentSession);
            setIsLoggedIn(!!currentSession);
            
            if (currentSession?.user) {
              console.log(`[Auth Debug] User authenticated: ${currentSession.user.id}`);
              console.log(`[Auth Debug] Auth provider: ${currentSession.user.app_metadata?.provider || 'email'}`);
              setSupabaseUser(currentSession.user);
              
              // Use setTimeout to prevent potential deadlocks
              setTimeout(async () => {
                try {
                  if (!isSubscribed) return;
                  
                  console.log(`[Auth Debug] Fetching profile for user: ${currentSession.user.id}`);
                  // Get user profile from database with retry logic
                  let retryCount = 0;
                  let profile = null;
                  
                  while (retryCount < 4 && !profile) { // Increased from 3 to 4 retries
                    try {
                      profile = await getUserProfile(currentSession.user.id);
                      if (profile) {
                        console.log(`[Auth Debug] Profile retrieved: success`);
                        break;
                      }
                      console.log(`[Auth Debug] Profile fetch attempt ${retryCount + 1} returned null`);
                    } catch (err) {
                      console.log(`[Auth Debug] Profile fetch attempt ${retryCount + 1} failed:`, err);
                      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased from 1000ms to 1500ms
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
                    // Use a fallback approach instead - create a minimal user object
                    setUser({
                      id: currentSession.user.id,
                      email: currentSession.user.email || '',
                      firstName: '',
                      lastName: '',
                      address: ''
                    });
                    console.log(`[Auth Debug] User object set with fallback data`);
                  }
                  setIsAuthReady(true);
                } catch (error) {
                  console.error('[Auth Debug] Error in auth state change handler:', error);
                  setIsAuthReady(true); // Mark as ready even on error to prevent hanging
                }
              }, 0);
            } else {
              if (isSubscribed) {
                setUser(null);
                setSupabaseUser(null);
                setIsAuthReady(true);
                console.log(`[Auth Debug] User and supabaseUser set to null (no session)`);
              }
            }
            
            if (event === 'SIGNED_OUT') {
              if (isSubscribed) {
                setUser(null);
                setSupabaseUser(null);
                setIsLoggedIn(false);
                setIsAuthReady(true);
                console.log(`[Auth Debug] Sign out event processed, state cleared`);
                
                // Perform thorough storage cleanup for all browsers, especially Safari
                try {
                  // Clear specific Supabase auth items in all storage locations
                  ['localStorage', 'sessionStorage'].forEach(storageType => {
                    try {
                      const storage = window[storageType as 'localStorage' | 'sessionStorage'];
                      if (storage) {
                        storage.removeItem('supabase.auth.token');
                        storage.removeItem('supabase.auth.refreshToken');
                        storage.removeItem('sb-yqcgqriecxtppuvcguyj-auth-token');
                      }
                    } catch (e) {
                      console.log(`[Auth Debug] Error clearing ${storageType}:`, e);
                    }
                  });
                } catch (e) {
                  console.log('[Auth Debug] Error during thorough storage cleanup:', e);
                }
              }
            }

            setIsLoading(false);
          }
        );

        // THEN check for existing session
        try {
          // Enhanced session check with retry and cross-storage validation
          const getInitialSession = async () => {
            // First check standard session
            const { data: { session: initialSession }, error } = await fetchWithRetry(
              () => supabase.auth.getSession(),
              { maxRetries: 3, initialDelay: 1500 }  // Increased retries and delay
            );
            
            if (error) {
              console.log('[Auth Debug] Error getting session:', error);
              
              // Try cross-storage validation for Safari
              if (navigator.userAgent.includes('Safari')) {
                console.log('[Auth Debug] Safari detected, trying cross-storage validation');
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
          console.log(`[Auth Debug] Initial user ID: ${initialSession?.user?.id || 'none'}`);
          
          if (initialSession?.user && isSubscribed) {
            setSession(initialSession);
            setSupabaseUser(initialSession.user);
            setIsLoggedIn(true);
            
            if (initialSession.access_token) {
              console.log(`[Auth Debug] Initial auth token length: ${initialSession.access_token.length}`);
            } else {
              console.warn('[Auth Debug] No access token in session');
            }
            
            // Get user profile from database with retry logic
            let retryCount = 0;
            let profile = null;
            
            while (retryCount < 4 && !profile) {  // Increased from 3 to 4 retries
              try {
                console.log(`[Auth Debug] Initial profile fetch attempt ${retryCount + 1}`);
                profile = await getUserProfile(initialSession.user.id);
                if (profile) break;
              } catch (err) {
                console.log(`[Auth Debug] Initial profile fetch attempt ${retryCount + 1} failed:`, err);
                await new Promise(resolve => setTimeout(resolve, 1500));  // Increased from 1000ms to 1500ms
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
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('[Auth Debug] Safari periodic session refresh');
            await supabase.auth.refreshSession();
          }
        } catch (e) {
          console.error('[Auth Debug] Error in periodic session refresh:', e);
        }
      }, 3 * 60 * 1000); // Every 3 minutes (reduced from 4 minutes)
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
