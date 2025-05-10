
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/auth/sessionManager';

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

// Also track authentication state during uploads to prevent logout flicker
let authDuringUpload = {
  wasAuthenticated: false,
  pendingUpload: false
};

// Reset auth state after upload completion
export const setUploadPending = (isPending: boolean) => {
  authDuringUpload.pendingUpload = isPending;
  console.log('[AuthGuard] Upload pending state changed to:', isPending);
  if (isPending) {
    authDuringUpload.wasAuthenticated = true;
  } else {
    // Clear the auth state after a delay
    setTimeout(() => {
      authDuringUpload.wasAuthenticated = false;
    }, 3000);
  }
};

// Check if auth should be preserved during upload
export const shouldPreserveAuth = () => {
  return authDuringUpload.pendingUpload || 
         (authDuringUpload.wasAuthenticated && activeUploadsCount > 0);
};

// Track manual logout to ensure proper handling
let manualLogoutInProgress = false;

// Set when logout starts and clear after redirect
export const setManualLogout = (inProgress: boolean) => {
  manualLogoutInProgress = inProgress;
  console.log('[AuthGuard] Manual logout in progress:', inProgress);
};

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, supabaseUser, isAuthReady, isLoading, session } = useAuth();
  const { toast } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';
  
  // Track if there are active uploads to prevent premature redirects
  const [hasActiveUploads, setHasActiveUploads] = useState(false);
  
  // Keep track of if a manual logout redirect is happening
  const [isManualLogout, setIsManualLogout] = useState(false);

  // Set manual logout state from the global tracking variable
  useEffect(() => {
    setIsManualLogout(manualLogoutInProgress);
  }, [location.pathname]);
  
  // Check for active uploads every 500ms
  useEffect(() => {
    const uploadCheckInterval = setInterval(() => {
      setHasActiveUploads(uploadStateManager.hasActiveUploads());
    }, 500);
    
    return () => clearInterval(uploadCheckInterval);
  }, []);

  // Add a delay before showing authentication errors
  // This helps prevent flash of auth errors during initialization
  // Use longer delay for mobile devices
  useEffect(() => {
    // Reduced delay for faster feedback
    const timer = setTimeout(() => {
      setDelayComplete(true);
      console.log('[AuthGuard] Initial delay complete, can show auth errors now');
    }, isMobile ? 3000 : 500);
    
    return () => clearTimeout(timer);
  }, [isMobile]);
  
  // Add safer redirect behavior for mobile
  const [mobileAuthTimeout, setMobileAuthTimeout] = useState(false);
  
  useEffect(() => {
    // On mobile, we add extra time before forcing a redirect
    // This helps prevent premature redirects during slow session restoration
    if (isMobile && !isLoggedIn && !isLoginPage && !hasActiveUploads) {
      // Verify the session status with the centralized function
      const checkSession = async () => {
        try {
          const isValid = await verifySession({ skipThrow: true });  // Using correct options object
          if (!isValid && isAuthReady) {
            console.log('[AuthGuard] Mobile session verification confirms user is not logged in');
            setMobileAuthTimeout(true);
          } else if (isValid) {
            console.log('[AuthGuard] Mobile session verification found valid session');
          }
        } catch (error) {
          console.error('[AuthGuard] Error during mobile session check:', error);
          // Set timeout anyway to prevent hanging
          setMobileAuthTimeout(true);
        }
      };
      
      // Wait a bit and then check the session
      const timer = setTimeout(() => {
        console.log('[AuthGuard] Mobile auth timeout reached, checking auth state with session manager');
        checkSession();
      }, 5000); // Reduced from 8000ms to 5000ms for faster feedback
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isLoggedIn, isLoginPage, isAuthReady, hasActiveUploads]);
  
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
    // 9. No auth was active during upload
    // 10. Not during manual logout
    const shouldShowToast = 
      isAuthReady && 
      !isLoggedIn && 
      !isLoginPage && 
      !supabaseUser && 
      delayComplete && 
      !showingToast &&
      (!isMobile || (isMobile && mobileAuthTimeout)) &&
      !hasActiveUploads && 
      !shouldPreserveAuth() &&
      !isManualLogout;
    
    if (shouldShowToast) {
      console.log('[AuthGuard] Showing auth required toast, details:', {
        isAuthReady,
        isLoggedIn,
        delayComplete,
        isMobile,
        mobileAuthTimeout,
        hasActiveUploads,
        shouldPreserveAuth: shouldPreserveAuth(),
        currentPath: location.pathname,
        isManualLogout
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
        action: {
          label: "Login",
          onClick: () => {
            window.location.href = '/login';
          }
        },
        onOpenChange: (open) => {
          if (!open) setShowingToast(false);
        }
      });
    }
  }, [
    isLoggedIn, 
    isLoginPage, 
    supabaseUser, 
    toast, 
    isAuthReady, 
    delayComplete, 
    showingToast, 
    mobileAuthTimeout,
    hasActiveUploads,
    isMobile,
    location.pathname,
    isManualLogout
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

  // If we're in a manual logout, don't redirect yet - the logout function will handle it
  if (isManualLogout) {
    console.log('[AuthGuard] Manual logout in progress, skipping redirect logic');
    return <>{children}</>;
  }

  // Only redirect if:
  // 1. Auth is ready
  // 2. User is not logged in 
  // 3. Not on login page
  // 4. For mobile, wait for the extra timeout
  // 5. No active uploads are in progress
  // 6. No auth was active during upload
  const shouldRedirectToLogin = isAuthReady && 
                             !isLoggedIn && 
                             !isLoginPage && 
                             (!isMobile || (isMobile && mobileAuthTimeout)) &&
                             !hasActiveUploads &&
                             !shouldPreserveAuth();
  
  if (shouldRedirectToLogin) {
    console.log('[AuthGuard] Redirecting to login page from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only redirect if auth is ready and user is logged in and on login page
  if (isAuthReady && isLoggedIn && isLoginPage) {
    console.log('[AuthGuard] User already logged in, redirecting from login page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
