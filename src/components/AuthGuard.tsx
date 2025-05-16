
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Use consistent import path
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// Maximum time to wait before forcing a redirect
const FORCE_REDIRECT_TIMEOUT = 2000; // 2 seconds

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, user, isAuthReady, isLoading, isAuthTransitioning } = useAuth();
  const { toast } = useToast();
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';

  // Debug logging for the current state
  useEffect(() => {
    console.log('[AuthGuard] Current state:', {
      isLoggedIn,
      isAuthReady,
      isLoginPage,
      isAuthTransitioning,
      user: user ? 'exists' : 'null',
      location: location.pathname,
    });
  }, [isLoggedIn, isAuthReady, isLoginPage, isAuthTransitioning, user, location.pathname]);

  // Force redirect if we're stuck in a redirect loop
  useEffect(() => {
    // Clear any existing timers
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    
    // If we need to redirect to login
    if ((isAuthReady && !isLoggedIn && !isLoginPage) || 
        (!isAuthReady && !isLoginPage)) {
      // Set up a timer to force redirect
      const timer = setTimeout(() => {
        console.log('[AuthGuard] Forcing redirect to login after timeout');
        setRedirectTimer(null);
        window.location.href = '/login'; // Use direct window navigation as a last resort
      }, FORCE_REDIRECT_TIMEOUT);
      
      setRedirectTimer(timer);
      
      return () => clearTimeout(timer);
    }
    
    // If we need to redirect to home
    if (isAuthReady && isLoggedIn && isLoginPage) {
      // Set up a timer to force redirect
      const timer = setTimeout(() => {
        console.log('[AuthGuard] Forcing redirect to home after timeout');
        setRedirectTimer(null);
        window.location.href = '/'; // Use direct window navigation as a last resort
      }, FORCE_REDIRECT_TIMEOUT);
      
      setRedirectTimer(timer);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthReady, isLoggedIn, isLoginPage, location.pathname]);

  // If auth is ready and we're not logged in and not on login page
  if (isAuthReady && !isLoggedIn && !isLoginPage) {
    console.log('[AuthGuard] Not logged in, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If auth is ready and we're logged in and on login page
  if (isAuthReady && isLoggedIn && isLoginPage) {
    console.log('[AuthGuard] Already logged in, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Show loading state while auth is initializing
  if (!isAuthReady || isAuthTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isAuthTransitioning ? "Processing authentication..." : "Checking authentication..."}
          </p>
          
          {/* Add emergency redirect button after a short delay */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">
              If you're stuck on this screen, try:
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we reach here, everything is ready and we can render children
  return <>{children}</>;
};

export default AuthGuard;
