
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

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

  // Add a delay before showing authentication errors
  // This helps prevent flash of auth errors during initialization
  // Use longer delay for mobile devices
  useEffect(() => {
    // Increased delay from 2500ms to 3500ms for mobile
    const timer = setTimeout(() => {
      setDelayComplete(true);
      console.log('[AuthGuard] Initial delay complete, can show auth errors now');
    }, isMobile ? 3500 : 1000); // Increased delay for mobile
    
    return () => clearTimeout(timer);
  }, [isMobile]);
  
  // Add more tolerant redirect behavior for mobile
  const [mobileAuthTimeout, setMobileAuthTimeout] = useState(false);
  
  useEffect(() => {
    // On mobile, we add extra time before forcing a redirect
    // This helps prevent premature redirects during slow session restoration
    if (isMobile && !isLoggedIn && !isLoginPage) {
      // Increased timeout from 4000ms to 6000ms
      const timer = setTimeout(() => {
        console.log('[AuthGuard] Mobile auth timeout reached, checking auth state again');
        // Only set timeout if auth is actually ready - prevents premature redirects
        if (isAuthReady && !isLoggedIn) {
          console.log('[AuthGuard] Auth is ready and user is not logged in, proceeding with redirect');
          setMobileAuthTimeout(true);
        } else if (!isAuthReady) {
          console.log('[AuthGuard] Auth not ready yet, delaying redirect decision');
          // If auth is not ready yet, give it more time
          // Increased extended timeout from 2500ms to 3500ms
          const extendedTimer = setTimeout(() => {
            console.log('[AuthGuard] Extended timeout reached, proceeding with redirect decision');
            // After extended timeout, only proceed if auth is ready
            if (isAuthReady) {
              setMobileAuthTimeout(true);
            } else {
              // If auth still not ready, give one more extended chance
              console.log('[AuthGuard] Auth still not ready after extended timeout, giving one more chance');
              // Increased final timer from 2000ms to 3000ms
              const finalTimer = setTimeout(() => {
                setMobileAuthTimeout(true);
              }, 3000);
              return () => clearTimeout(finalTimer);
            }
          }, 3500); // Additional 3.5s
          return () => clearTimeout(extendedTimer);
        }
      }, 6000); // Increased from 4s to 6s for mobile devices
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isLoggedIn, isLoginPage, isAuthReady]);
  
  useEffect(() => {
    // Only show authentication toast when:
    // 1. Auth is fully ready
    // 2. User is not logged in
    // 3. Not on login page
    // 4. No user object exists
    // 5. Delay has completed (prevents flash)
    // 6. No toast is currently showing
    // 7. Mobile timeout has been reached (if mobile)
    const shouldShowToast = 
      isAuthReady && 
      !isLoggedIn && 
      !isLoginPage && 
      !supabaseUser && 
      delayComplete && 
      !showingToast &&
      (!isMobile || (isMobile && mobileAuthTimeout));
    
    if (shouldShowToast) {
      console.log('[AuthGuard] Showing auth required toast, details:', {
        isAuthReady,
        isLoggedIn,
        delayComplete,
        isMobile,
        mobileAuthTimeout,
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
    isMobile,
    location.pathname
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

  // Only redirect if auth is ready and user is not logged in and not on login page
  // For mobile, wait for the extra timeout before redirecting
  const shouldRedirectToLogin = isAuthReady && !isLoggedIn && !isLoginPage && 
                              (!isMobile || (isMobile && mobileAuthTimeout));
  
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
