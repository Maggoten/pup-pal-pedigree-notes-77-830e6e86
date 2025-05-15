
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  const { isLoggedIn, supabaseUser, isAuthReady, isLoading } = useAuth();
  const { toast } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';
  
  // Track if there are active uploads to prevent premature redirects
  const [hasActiveUploads, setHasActiveUploads] = useState(false);
  
  // Track network state for mobile
  const [isOffline, setIsOffline] = useState(!isOnline());
  
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
    if (isMobile && !isLoggedIn && !isLoginPage && !hasActiveUploads) {
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
  }, [isMobile, isLoggedIn, isLoginPage, isAuthReady, hasActiveUploads]);
  
  // Handle offline state for mobile
  if (isMobile && isOffline) {
    console.log('[AuthGuard] Mobile device is offline');
    // Don't redirect to login if device is offline
    return <>{children}</>;
  }
  
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
    const shouldShowToast = 
      isAuthReady && 
      !isLoggedIn && 
      !isLoginPage && 
      !supabaseUser && 
      delayComplete && 
      !showingToast &&
      (!isMobile || (isMobile && mobileAuthTimeout)) &&
      !hasActiveUploads;
    
    if (shouldShowToast) {
      console.log('[AuthGuard] Showing auth required toast, details:', {
        isAuthReady,
        isLoggedIn,
        delayComplete,
        isMobile,
        mobileAuthTimeout,
        hasActiveUploads,
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
    isOffline
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
  // 6. Not offline on mobile
  const shouldRedirectToLogin = isAuthReady && 
                              !isLoggedIn && 
                              !isLoginPage && 
                              (!isMobile || (isMobile && mobileAuthTimeout)) &&
                              !hasActiveUploads &&
                              !(isMobile && isOffline);
  
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
