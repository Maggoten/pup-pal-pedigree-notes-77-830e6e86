
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { debounce, isOnline } from '@/utils/fetchUtils';
import { toast } from 'sonner';

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
  const { isLoggedIn, user, isAuthReady, isLoading, isLoggingOut } = useAuth();
  const [delayComplete, setDelayComplete] = useState(false);
  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;
  const lastToastTimeRef = useRef<number>(0);

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
  
  // Simplified toast logic using Sonner with debouncing
  useEffect(() => {
    // Core conditions for showing auth required toast:
    // 1. Auth is ready (or timeout reached)
    // 2. User is not logged in
    // 3. Not on login page
    // 4. Not currently logging out
    // 5. Initial delay complete
    const shouldShowToast = 
      (isAuthReady || authTimeout) && 
      !isLoggedIn && 
      !isLoginPage && 
      !isLoggingOut &&
      delayComplete;
    
    if (shouldShowToast) {
      const currentTime = Date.now();
      const timeSinceLastToast = currentTime - lastToastTimeRef.current;
      
      // Debounce: only show toast if 3 seconds have passed since last one
      if (timeSinceLastToast > 3000) {
        console.log('[AuthGuard] Showing auth required toast');
        
        toast.error("Authentication required", {
          description: "Please log in to access this page",
          duration: isMobile ? 4000 : 3000, // Longer duration on mobile
        });
        
        lastToastTimeRef.current = currentTime;
      }
    }
  }, [
    isLoggedIn, 
    isLoginPage, 
    isAuthReady, 
    delayComplete, 
    authTimeout,
    isLoggingOut,
    isMobile
  ]);

  // Clear toast debounce timer on successful login
  useEffect(() => {
    if (isLoggedIn) {
      lastToastTimeRef.current = 0;
    }
  }, [isLoggedIn]);

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

  // Only redirect if:
  // 1. Auth is ready
  // 2. User is not logged in 
  // 3. Not on login page
  // 4. No active uploads are in progress
  // 5. Not offline on mobile
  // 6. NOT currently logging out (prevents redirect race condition)
  const shouldRedirectToLogin = (isAuthReady || authCheckFailed) && 
                              !isLoggedIn && 
                              !isLoginPage && 
                              !hasActiveUploads &&
                              !(isMobile && isOffline) &&
                              !isLoggingOut;
  
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
