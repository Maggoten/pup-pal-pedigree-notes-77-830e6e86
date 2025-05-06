
import { useState, useEffect, ReactNode } from 'react';
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
  const { login, register, logout, getUserProfile } = useAuthActions();

  // Log device info immediately
  useEffect(() => {
    const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
    const browserType = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 
                        navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other';
    console.log(`[Auth Debug] Device type: ${deviceType}, Browser: ${browserType}, User Agent: ${navigator.userAgent}`);
  }, []);

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
                
                // Safari needs explicit storage clearing in some cases
                try {
                  localStorage.removeItem('supabase.auth.token');
                  sessionStorage.removeItem('supabase.auth.token');
                } catch (e) {
                  console.log('[Auth Debug] Error clearing auth storage:', e);
                }
              }
            }

            setIsLoading(false);
          }
        );

        // THEN check for existing session
        try {
          const { data: { session: initialSession }, error } = await fetchWithRetry(
            () => supabase.auth.getSession(),
            { maxRetries: 3, initialDelay: 1500 }  // Increased retries and delay
          );
          
          if (error) {
            console.log('[Auth Debug] Error getting session:', error);
            
            // Try a fallback approach for Safari
            if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
              console.log('[Auth Debug] Safari detected, trying session refresh');
              await supabase.auth.refreshSession();
              const refreshResult = await supabase.auth.getSession();
              if (!refreshResult.error && refreshResult.data.session) {
                console.log('[Auth Debug] Safari session refresh successful');
              }
            }
          }
          
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
      }, 4 * 60 * 1000); // Every 4 minutes
    }
    
    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      if (refreshTimer) clearInterval(refreshTimer);
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
