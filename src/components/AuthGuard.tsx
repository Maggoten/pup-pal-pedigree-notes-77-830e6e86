
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { debounce, isOnline } from '@/utils/fetchUtils';

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

// Track recent auth state changes to prevent redirect loops
let lastAuthStateChange = 0;
let lastRedirectTime = 0;
const REDIRECT_COOLDOWN = 500; // 500ms cooldown between redirects
const AUTH_STATE_DEBOUNCE = 300; // 300ms debounce for auth state changes

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, user, isAuthReady, isLoading, authTransitioning } = useAuth();
  const { toast } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;
  const [previouslyLoggedIn, setPreviouslyLoggedIn] = useState(false);

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';
  
  // Track if there are active uploads to prevent premature redirects
  const [hasActiveUploads, setHasActiveUploads] = useState(false);
  
  // Track network state for mobile
  const [isOffline, setIsOffline] = useState(!isOnline());
  
  // Maximum time to wait for auth before assuming there's a problem
  const [authTimeout, setAuthTimeout] = useState(false);

  // Has a redirect recently occurred?
  const [recentRedirect, setRecentRedirect] = useState(false);

  // Track login state changes to detect logouts
  useEffect(() => {
    if (previouslyLoggedIn && !isLoggedIn && isAuthReady) {
      console.log('[AuthGuard] Detected logout, user was logged in but now is not');
      // Update timestamp to prevent immediate redirect
      lastAuthStateChange = Date.now();
    }
    
    setPreviouslyLoggedIn(isLoggedIn);
  }, [isLoggedIn, isAuthReady, previouslyLoggedIn]);
  
  // Check for active uploads every 500ms
  useEffect(() => {
    const uploadCheckInterval = setInterval(() => {
      setHasActiveUploads(uploadStateManager.hasActiveUploads());
    }, 500);
    
    return () => clearInterval(uploadCheckInterval);
  }, []);
  
  // Track network state
  useEffect(() => {
    if (!isMobile) return; // Only needed for mobile
    
    const updateOnlineStatus = () => {
      const online = isOnline();
      setIsOffline(!online);
      
      // On reconnection, give time for auth to restore
      if (online && !isLoggedIn) {
        console.log('[AuthGuard] Network reconnected, waiting for auth state to restore');
        // Don't redirect immediately on reconnection
      }
    };
    
    // Debounce to prevent rapid changes
    const debouncedUpdateStatus = debounce(updateOnlineStatus, 1000);
    
    window.addEventListener('online', debouncedUpdateStatus);
    window.addEventListener('offline', debouncedUpdateStatus);
    
    return () => {
      window.removeEventListener('online', debouncedUpdateStatus);
      window.removeEventListener('offline', debouncedUpdateStatus);
    };
  }, [isMobile, isLoggedIn]);

  // Add a delay before showing authentication errors
  // This helps prevent flash of auth errors during initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
      console.log('[AuthGuard] Initial delay complete, can show auth errors now');
    }, 1000); // Reduced from previous values for faster response
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add a hard timeout for authentication to prevent infinite "checking authentication"
  useEffect(() => {
    const timeoutDuration = 8000; // 8 seconds max wait time
    
    const timer = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('[AuthGuard] Auth readiness timeout reached - forcing timeout state');
        setAuthTimeout(true);
      }
    }, timeoutDuration);
    
    return () => clearTimeout(timer);
  }, [isAuthReady]);
  
  // Implement redirect cooldown to prevent loops
  useEffect(() => {
    if (recentRedirect) {
      const timer = setTimeout(() => {
        setRecentRedirect(false);
      }, REDIRECT_COOLDOWN);
      return () => clearTimeout(timer);
    }
  }, [recentRedirect]);
  
  // Show toast for authentication issues
  useEffect(() => {
    // Only show authentication toast when:
    // 1. Auth is fully ready OR timeout has been reached
    // 2. User is not logged in
    // 3. Not on login page
    // 4. No user object exists
    // 5. Delay has completed (prevents flash)
    // 6. No toast is currently showing
    // 7. No active uploads are in progress
    // 8. Not in auth transition state
    const shouldShowToast = 
      (isAuthReady || authTimeout) && 
      !isLoggedIn && 
      !isLoginPage && 
      !user && 
      delayComplete && 
      !showingToast &&
      !hasActiveUploads &&
      !authTransitioning;
    
    if (shouldShowToast) {
      console.log('[AuthGuard] Showing auth required toast');
      
      setShowingToast(true);
      
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
        onOpenChange: (open) => {
          if (!open) setShowingToast(false);
        }
      });
    }
  }, [
    isLoggedIn, 
    isLoginPage, 
    user, 
    toast, 
    isAuthReady, 
    delayComplete, 
    showingToast,
    hasActiveUploads,
    authTimeout,
    authTransitioning
  ]);

  // Allow bypassing auth check after timeout to prevent infinite loading
  const authCheckFailed = authTimeout && !isAuthReady;

  // Show loading state while auth is not ready (with timeout safety)
  if (!isAuthReady && !authTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Checking authentication...
            {authTimeout && <span> (Timeout reached)</span>}
          </p>
        </div>
      </div>
    );
  }

  // Log state variables for debugging
  console.log('[AuthGuard] State:', { 
    isAuthReady, 
    isLoggedIn, 
    isLoginPage, 
    hasActiveUploads, 
    isMobile, 
    isOffline,
    authCheckFailed,
    authTransitioning,
    pathname: location.pathname,
    timeSinceLastAuthChange: Date.now() - lastAuthStateChange,
    timeSinceLastRedirect: Date.now() - lastRedirectTime
  });

  // Prevent redirect loops by checking for recent redirects or auth state changes
  const canRedirect = () => {
    const now = Date.now();
    const timeSinceLastAuth = now - lastAuthStateChange;
    const timeSinceLastRedirect = now - lastRedirectTime;
    
    // Don't redirect if we're in a transition state
    if (authTransitioning) {
      console.log('[AuthGuard] Skipping redirect during auth transition');
      return false;
    }
    
    // Don't redirect if we recently redirected
    if (timeSinceLastRedirect < REDIRECT_COOLDOWN) {
      console.log('[AuthGuard] Skipping redirect - too soon after last redirect');
      return false;
    }
    
    // Don't redirect if auth state recently changed
    if (timeSinceLastAuth < AUTH_STATE_DEBOUNCE) {
      console.log('[AuthGuard] Skipping redirect - too soon after auth state change');
      return false;
    }
    
    return true;
  };

  // Only redirect to login if:
  // 1. Auth is ready
  // 2. User is not logged in 
  // 3. Not on login page
  // 4. No active uploads are in progress
  // 5. Not offline on mobile
  // 6. Not in a redirect cooldown period
  const shouldRedirectToLogin = (isAuthReady || authCheckFailed) && 
                              !isLoggedIn && 
                              !isLoginPage && 
                              !hasActiveUploads &&
                              !(isMobile && isOffline) &&
                              canRedirect();
  
  if (shouldRedirectToLogin) {
    console.log('[AuthGuard] Redirecting to login page from:', location.pathname);
    lastRedirectTime = Date.now();
    setRecentRedirect(true);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only redirect if auth is ready and user is logged in and on login page
  const shouldRedirectFromLogin = isAuthReady && 
                                isLoggedIn && 
                                isLoginPage &&
                                canRedirect() &&
                                !authTransitioning;
                                
  if (shouldRedirectFromLogin) {
    console.log('[AuthGuard] User already logged in, redirecting from login page');
    lastRedirectTime = Date.now();
    setRecentRedirect(true);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
