import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { validateCrossStorageSession, verifySession } from '@/utils/storage/core/session';

// Add a global state to track active uploads across components
let activeUploadsCount = 0;

// Expose functions to manage the upload state
export const uploadStateManager = {
  incrementUploads: () => { 
    activeUploadsCount++;
    console.log('[AuthGuard] Active uploads increased to:', activeUploadsCount);
  },
  decrementUploads: () => {
    if (activeUploadsCount > 0) activeUploadsCount--;
    console.log('[AuthGuard] Active uploads decreased to:', activeUploadsCount);
  },
  getActiveUploads: () => activeUploadsCount,
  hasActiveUploads: () => activeUploadsCount > 0
};

// Keep track of recently visited authenticated pages to support "return to"
const recentAuthPaths: string[] = [];
const MAX_RECENT_PATHS = 5;

// Add path to recent list
export const trackAuthenticatedPath = (path: string) => {
  if (path === '/login' || path === '/register') return;
  
  // Remove if already exists (to move it to the front)
  const existingIndex = recentAuthPaths.indexOf(path);
  if (existingIndex > -1) {
    recentAuthPaths.splice(existingIndex, 1);
  }
  
  // Add to front
  recentAuthPaths.unshift(path);
  
  // Keep list at max size
  if (recentAuthPaths.length > MAX_RECENT_PATHS) {
    recentAuthPaths.pop();
  }
};

// Get most recent authenticated path
export const getMostRecentAuthPath = (): string => {
  return recentAuthPaths[0] || '/';
};

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, supabaseUser, isAuthReady, isLoading } = useAuth();
  const { toast } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;
  
  // Keep track of authentication status post verification
  const [verifiedAuth, setVerifiedAuth] = useState<boolean | null>(null);

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;
  
  // Track current path for "return to" functionality
  useEffect(() => {
    if (isLoggedIn && !isAuthPage) {
      trackAuthenticatedPath(location.pathname);
    }
  }, [isLoggedIn, isAuthPage, location.pathname]);
  
  // Track if there are active uploads to prevent premature redirects
  const [hasActiveUploads, setHasActiveUploads] = useState(false);
  
  // Check for active uploads every 500ms
  useEffect(() => {
    const uploadCheckInterval = setInterval(() => {
      setHasActiveUploads(uploadStateManager.hasActiveUploads());
    }, 500);
    
    return () => clearInterval(uploadCheckInterval);
  }, []);
  
  // Enhanced session verification for mobile
  useEffect(() => {
    // Only run verification when auth is ready
    if (isAuthReady && !isAuthPage) {
      // Use a different approach for mobile - more tolerant and uses local cache
      const verifyAuthStatus = async () => {
        try {
          // For mobile, use cross-storage validation for more resilience
          if (isMobile) {
            const isValid = await validateCrossStorageSession();
            setVerifiedAuth(isValid);
            return;
          }
          
          // For desktop, use standard session verification
          const isValid = await verifySession({ 
            respectAuthReady: true, 
            authReady: isAuthReady,
            skipThrow: true
          });
          setVerifiedAuth(isValid);
        } catch (e) {
          console.error('[AuthGuard] Error verifying session:', e);
          setVerifiedAuth(false);
        }
      };
      
      verifyAuthStatus();
    } else if (isAuthPage) {
      // No verification needed on auth pages
      setVerifiedAuth(isLoggedIn);
    }
  }, [isAuthReady, isLoggedIn, isAuthPage, isMobile]);

  // Add a delay before showing authentication errors
  // This helps prevent flash of auth errors during initialization
  // Use longer delay for mobile devices
  useEffect(() => {
    // Increased delay from 3500ms to 5000ms for mobile
    const timer = setTimeout(() => {
      setDelayComplete(true);
      console.log('[AuthGuard] Initial delay complete, can show auth errors now');
    }, isMobile ? 5000 : 1000);
    
    return () => clearTimeout(timer);
  }, [isMobile]);
  
  // Add more tolerant redirect behavior for mobile
  const [mobileAuthTimeout, setMobileAuthTimeout] = useState(false);
  
  useEffect(() => {
    // On mobile, we add extra time before forcing a redirect
    // This helps prevent premature redirects during slow session restoration
    if (isMobile && !isLoggedIn && !isAuthPage && !hasActiveUploads) {
      // Increased timeout from 6000ms to 8000ms
      const timer = setTimeout(() => {
        console.log('[AuthGuard] Mobile auth timeout reached, checking auth state again');
        // Only set timeout if auth is actually ready - prevents premature redirects
        if (isAuthReady && !isLoggedIn) {
          console.log('[AuthGuard] Auth is ready and user is not logged in, proceeding with redirect');
          setMobileAuthTimeout(true);
        } else if (!isAuthReady) {
          console.log('[AuthGuard] Auth not ready yet, delaying redirect decision');
          // If auth is not ready yet, give it more time
          // Increased extended timeout from 3500ms to 5000ms
          const extendedTimer = setTimeout(() => {
            console.log('[AuthGuard] Extended timeout reached, proceeding with redirect decision');
            // After extended timeout, only proceed if auth is ready
            if (isAuthReady) {
              setMobileAuthTimeout(true);
            } else {
              // If auth still not ready, give one more extended chance
              console.log('[AuthGuard] Auth still not ready after extended timeout, giving one more chance');
              // Increased final timer from 3000ms to 5000ms
              const finalTimer = setTimeout(() => {
                setMobileAuthTimeout(true);
              }, 5000);
              return () => clearTimeout(finalTimer);
            }
          }, 5000);
          return () => clearTimeout(extendedTimer);
        }
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isLoggedIn, isAuthPage, isAuthReady, hasActiveUploads]);
  
  // Add a verification check to try to restore sessions on mobile
  useEffect(() => {
    // For mobile only - if auth is not ready or user is not logged in
    // attempt an extra session verification after delay
    if (isMobile && (!isAuthReady || !isLoggedIn) && !isAuthPage) {
      const timer = setTimeout(async () => {
        try {
          console.log('[AuthGuard] Attempting mobile session restoration');
          const isSessionValid = await validateCrossStorageSession();
          
          if (isSessionValid) {
            console.log('[AuthGuard] Successfully validated cross-storage session');
            // Force refresh if possible
            window.location.reload();
          }
        } catch (e) {
          console.error('[AuthGuard] Error during mobile session restoration:', e);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isAuthReady, isLoggedIn, isAuthPage]);
  
  useEffect(() => {
    // Only show authentication toast when:
    // 1. Auth is fully ready
    // 2. User is not logged in
    // 3. Not on login page
    // 4. No user object exists
    // 5. Delay has completed (prevents flash)
    // 6. No toast is currently showing
    // 7. Mobile timeout has been reached (if mobile)
    // 8. No active uploads are in progress
    // 9. Verified auth status is false (if available)
    const shouldShowToast = 
      isAuthReady && 
      !isLoggedIn && 
      !isAuthPage && 
      !supabaseUser && 
      delayComplete && 
      !showingToast &&
      (!isMobile || (isMobile && mobileAuthTimeout)) &&
      !hasActiveUploads &&
      (verifiedAuth === false);
    
    if (shouldShowToast) {
      console.log('[AuthGuard] Showing auth required toast, details:', {
        isAuthReady,
        isLoggedIn,
        delayComplete,
        isMobile,
        mobileAuthTimeout,
        hasActiveUploads,
        verifiedAuth,
        currentPath: location.pathname
      });
      
      setShowingToast(true);
      
      // Customize message for mobile
      const message = isMobile 
        ? "Please log in to continue. If you were previously logged in, please try refreshing the page."
        : "Please log in to access this page";
      
      toast({
        title: "Authentication required",
        description: message,
        variant: "destructive",
        onOpenChange: (open) => {
          if (!open) setShowingToast(false);
        }
      });
    }
  }, [
    isLoggedIn, 
    isAuthPage, 
    supabaseUser, 
    toast, 
    isAuthReady, 
    delayComplete, 
    showingToast, 
    mobileAuthTimeout,
    hasActiveUploads,
    isMobile,
    location.pathname,
    verifiedAuth
  ]);

  // Show loading state while auth is not ready
  if (!isAuthReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isMobile ? 'Initializing mobile authentication...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // Only redirect if:
  // 1. Auth is ready
  // 2. User is not logged in 
  // 3. Not on login page
  // 4. For mobile, wait for the extra timeout
  // 5. No active uploads are in progress
  // 6. Verified auth status is false (if available)
  const shouldRedirectToLogin = isAuthReady && 
                              !isLoggedIn && 
                              !isAuthPage && 
                              (!isMobile || (isMobile && mobileAuthTimeout)) &&
                              !hasActiveUploads &&
                              (verifiedAuth === false || verifiedAuth === null);
  
  if (shouldRedirectToLogin) {
    console.log('[AuthGuard] Redirecting to login page from:', location.pathname);
    // Store the current path for returning after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only redirect if auth is ready and user is logged in and on login page
  if (isAuthReady && isLoggedIn && isAuthPage) {
    console.log('[AuthGuard] User already logged in, redirecting from login page');
    // Get the path from the location state or use the most recent auth path
    const returnPath = location.state?.from?.pathname || getMostRecentAuthPath() || '/';
    return <Navigate to={returnPath} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
