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

interface AuthGuardProps {
  children: React.ReactNode;
}

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
  useEffect(() => {
    // Only set redirect safety after a small delay to allow state to settle
    if (isAuthReady && !isAuthTransitioning) {
      const timer = setTimeout(() => {
        setRedirectSafe(true);
        console.log('[AuthGuard] Redirect safety enabled, auth state settled');
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // Reset redirect safety during transitions
      setRedirectSafe(false);
    }
  }, [isAuthReady, isAuthTransitioning, isLoggedIn]);
  
  // Show toast for authentication issues
  useEffect(() => {
    // Only show authentication toast when:
    // All previous conditions plus:
    // - Not during auth transition
    // - Redirect is considered safe
    const shouldShowToast = 
      (isAuthReady || authTimeout) && 
      !isLoggedIn && 
      !isLoginPage && 
      !user && 
      delayComplete && 
      !showingToast &&
      !hasActiveUploads &&
      !isAuthTransitioning &&
      redirectSafe;
    
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
    redirectSafe
  ]);

  // Allow bypassing auth check after timeout to prevent infinite loading
  const authCheckFailed = authTimeout && !isAuthReady;

  // Show loading state while auth is not ready or during transitions
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

  // Only redirect if:
  // 1. Auth is ready
  // 2. User is not logged in 
  // 3. Not on login page
  // 4. No active uploads are in progress
  // 5. Not offline on mobile
  // 6. Not during auth transition
  // 7. Redirect is safe (after delay)
  const shouldRedirectToLogin = (isAuthReady || authCheckFailed) && 
                              !isLoggedIn && 
                              !isLoginPage && 
                              !hasActiveUploads &&
                              !(isMobile && isOffline) &&
                              !isAuthTransitioning &&
                              redirectSafe;
  
  if (shouldRedirectToLogin) {
    console.log('[AuthGuard] Redirecting to login page from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only redirect if: 
  // 1. Auth is ready
  // 2. User is logged in and on login page
  // 3. Not during auth transition
  // 4. Redirect is safe (after delay)
  const shouldRedirectToHome = isAuthReady && 
                             isLoggedIn && 
                             isLoginPage &&
                             !isAuthTransitioning &&
                             redirectSafe;
                             
  if (shouldRedirectToHome) {
    console.log('[AuthGuard] User already logged in, redirecting from login page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
