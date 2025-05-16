
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Use consistent import path
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

interface AuthGuardProps {
  children: React.ReactNode;
}

// Add navigation cooldown tracking
let lastNavigationTime = 0;
const NAVIGATION_COOLDOWN = 800; // ms
const MAX_REDIRECT_WAIT = 3000; // ms - maximum time to wait before forcing redirect

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, user, isAuthReady, isLoading, isAuthTransitioning } = useAuth();
  const { toast } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);
  const [redirectSafe, setRedirectSafe] = useState(false);
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';
  
  // Track if there are active uploads to prevent premature redirects
  const [hasActiveUploads, setHasActiveUploads] = useState(false);
  
  // Track network state for mobile
  const [isOffline, setIsOffline] = useState(!isOnline());
  
  // Maximum time to wait for auth before assuming there's a problem
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Navigation cooldown to prevent rapid redirects
  const [navigationAllowed, setNavigationAllowed] = useState(true);
  
  // NEW: Track if redirect is in progress
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
  // NEW: Force redirect after timeout
  const [forceRedirect, setForceRedirect] = useState(false);
  
  // Debug logging for the current state
  useEffect(() => {
    console.log('[AuthGuard] Current state:', {
      isLoggedIn,
      isAuthReady,
      isLoginPage,
      isAuthTransitioning,
      redirectInProgress,
      user: user ? 'exists' : 'null',
      location: location.pathname,
      redirectSafe,
      navigationAllowed,
      forceRedirect
    });
  }, [isLoggedIn, isAuthReady, isLoginPage, isAuthTransitioning, user, 
      location.pathname, redirectSafe, navigationAllowed, redirectInProgress, forceRedirect]);
  
  // Navigation cooldown to prevent rapid redirects
  useEffect(() => {
    if (!navigationAllowed) {
      const timerId = setTimeout(() => {
        console.log('[AuthGuard] Navigation cooldown complete, allowing navigation');
        setNavigationAllowed(true);
      }, NAVIGATION_COOLDOWN);
      
      return () => clearTimeout(timerId);
    }
  }, [navigationAllowed]);
  
  // NEW: Force redirect after timeout if stuck in redirect process
  useEffect(() => {
    if (redirectInProgress && !isLoggedIn && !isLoginPage) {
      console.log('[AuthGuard] Setting up force redirect timeout');
      const forceTimer = setTimeout(() => {
        console.log('[AuthGuard] Force redirect timeout reached, forcing redirect');
        setForceRedirect(true);
        // Also clear any potential blockers
        setNavigationAllowed(true);
        setRedirectSafe(true);
      }, MAX_REDIRECT_WAIT);
      
      return () => clearTimeout(forceTimer);
    }
  }, [redirectInProgress, isLoggedIn, isLoginPage]);
  
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
  
  // Add a delay after auth state changes to prevent redirect loops
  // Extended the delay from 300ms to 500ms
  useEffect(() => {
    // Only set redirect safety after a delay to allow state to settle
    if (isAuthReady && !isAuthTransitioning) {
      const timer = setTimeout(() => {
        setRedirectSafe(true);
        console.log('[AuthGuard] Redirect safety enabled, auth state settled');
      }, 500); // Increased from 300ms to 500ms
      
      return () => clearTimeout(timer);
    } else {
      // Reset redirect safety during transitions
      setRedirectSafe(false);
      console.log('[AuthGuard] Redirect safety disabled during auth transition');
    }
  }, [isAuthReady, isAuthTransitioning, isLoggedIn]);
  
  // Enhanced logic for showing authentication toast
  // Prioritize redirect over toast when not logged in
  useEffect(() => {
    // Only show authentication toast when we can't redirect but need to show error
    const shouldShowToast = 
      (isAuthReady || authTimeout) && 
      !isLoggedIn && 
      !isLoginPage && 
      !user && 
      delayComplete && 
      !showingToast &&
      !hasActiveUploads &&
      !isAuthTransitioning &&
      redirectSafe &&
      !redirectInProgress && // Don't show toast if we're already redirecting
      !navigationAllowed; // Only show toast if we can't navigate (due to cooldown)
    
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
    isAuthTransitioning,
    redirectSafe,
    navigationAllowed,
    redirectInProgress
  ]);

  // Allow bypassing auth check after timeout to prevent infinite loading
  const authCheckFailed = authTimeout && !isAuthReady;

  // CRITICAL FIX: Force redirect after timeout even if other conditions aren't met
  if (forceRedirect && !isLoginPage) {
    console.log('[AuthGuard] FORCE REDIRECTING to login after timeout');
    // Reset states to prevent getting stuck again
    setRedirectInProgress(false);
    setForceRedirect(false);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Immediately block protected content if not logged in and auth is ready
  if ((isAuthReady || authCheckFailed) && 
      !isLoggedIn && 
      !isLoginPage && 
      !isAuthTransitioning) {
    // Don't show protected content even during redirects
    // This ensures user can't see protected content while redirect is pending
    
    // Only attempt redirect if navigation is allowed and not already in progress
    const shouldRedirect = (redirectSafe && 
                         navigationAllowed && 
                         !redirectInProgress && 
                         !hasActiveUploads && 
                         !(isMobile && isOffline)) || 
                         forceRedirect; // Also allow redirect on force flag
    
    if (shouldRedirect) {
      console.log('[AuthGuard] Redirecting to login page from:', location.pathname);
      // Set flags to prevent duplicate redirects
      setRedirectInProgress(true);
      setNavigationAllowed(false);
      lastNavigationTime = Date.now();
      
      // Return redirect component
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // If we can't redirect yet, show a loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Redirecting to login page...
          </p>
          {redirectInProgress && (
            <p className="text-xs text-muted-foreground">
              If you're not redirected shortly, <a href="/login" className="text-blue-500 hover:underline">click here</a>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show loading state during auth transitions
  if ((!isAuthReady && !authTimeout) || isAuthTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isAuthTransitioning ? "Processing authentication..." : "Checking authentication..."}
            {authTimeout && <span> (Timeout reached)</span>}
          </p>
        </div>
      </div>
    );
  }

  // Redirect from login to home if already logged in
  // Only redirect if all conditions are met
  const shouldRedirectToHome = isAuthReady && 
                              isLoggedIn && 
                              isLoginPage &&
                              !isAuthTransitioning &&
                              redirectSafe && 
                              navigationAllowed;
                             
  if (shouldRedirectToHome) {
    console.log('[AuthGuard] User already logged in, redirecting from login page');
    // Set navigation cooldown to prevent rapid redirects
    setNavigationAllowed(false);
    setRedirectInProgress(true);
    lastNavigationTime = Date.now();
    return <Navigate to="/" replace />;
  }

  // Finally, render children only if we should show the protected content
  // For login page, always show content
  // For other pages, only show if user is logged in
  const shouldShowContent = isLoginPage || (isAuthReady && isLoggedIn);
  
  if (!shouldShowContent) {
    console.log('[AuthGuard] Blocking access to protected content');
    // This should not happen often because we should redirect first
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Access restricted. Redirecting to login...
          </p>
          <p className="text-xs text-muted-foreground">
            If you're not redirected shortly, <a href="/login" className="text-blue-500 hover:underline">click here</a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
