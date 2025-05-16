
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, LogIn } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { debounce, isOnline } from '@/utils/fetchUtils';
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

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, isAuthReady, isLoading, logout } = useAuth();
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
  
  // Maximum time to wait for auth before assuming there's a problem
  const [authTimeout, setAuthTimeout] = useState(false);

  // Handle manual redirect to login page
  const handleManualRedirect = () => {
    console.log('[AuthGuard] Manual redirect to login triggered');
    navigate('/login', { state: { from: location }, replace: true });
  };
  
  // Check for active uploads periodically
  useEffect(() => {
    const uploadCheckInterval = setInterval(() => {
      setHasActiveUploads(uploadStateManager.hasActiveUploads());
    }, 500);
    
    return () => clearInterval(uploadCheckInterval);
  }, []);
  
  // Track network state
  useEffect(() => {
    if (!isMobile) return;
    
    const updateOnlineStatus = () => {
      const online = isOnline();
      setIsOffline(!online);
    };
    
    const debouncedUpdateStatus = debounce(updateOnlineStatus, 1000);
    
    window.addEventListener('online', debouncedUpdateStatus);
    window.addEventListener('offline', debouncedUpdateStatus);
    
    return () => {
      window.removeEventListener('online', debouncedUpdateStatus);
      window.removeEventListener('offline', debouncedUpdateStatus);
    };
  }, [isMobile]);

  // Add a delay before showing authentication errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
      console.log('[AuthGuard] Initial delay complete, can show auth errors now');
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add a hard timeout for authentication to prevent infinite "checking authentication"
  useEffect(() => {
    const timeoutDuration = 6000; // 6 seconds max wait time
    
    const timer = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('[AuthGuard] Auth readiness timeout reached - forcing timeout state');
        setAuthTimeout(true);
        
        // Show timeout toast
        toast({
          title: "Authentication issue",
          description: "Taking too long to verify your login status. You can try logging in again.",
          variant: "destructive",
          action: (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleManualRedirect}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Go to Login
            </Button>
          )
        });
      }
    }, timeoutDuration);
    
    return () => clearTimeout(timer);
  }, [isAuthReady, toast]);
  
  // Show toast for authentication issues
  useEffect(() => {
    const shouldShowToast = 
      (isAuthReady || authTimeout) && 
      !isLoggedIn && 
      !isLoginPage && 
      !user && 
      delayComplete && 
      !showingToast &&
      !hasActiveUploads;
    
    if (shouldShowToast) {
      console.log('[AuthGuard] Showing auth required toast');
      
      setShowingToast(true);
      
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
        action: (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleManualRedirect}
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Button>
        ),
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
    authTimeout
  ]);

  // Show loading state while auth is not ready (with timeout safety)
  if (!isAuthReady && !authTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
          
          {/* Manual redirect option after a delay */}
          <div className="mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRedirect}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only redirect if proper conditions are met
  const shouldRedirectToLogin = (isAuthReady || authTimeout) && 
                              !isLoggedIn && 
                              !isLoginPage && 
                              !hasActiveUploads &&
                              !(isMobile && isOffline);
  
  if (shouldRedirectToLogin) {
    console.log('[AuthGuard] Redirecting to login page from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect from login page if already logged in
  if (isAuthReady && isLoggedIn && isLoginPage) {
    console.log('[AuthGuard] User already logged in, redirecting from login page');
    return <Navigate to="/" replace />;
  }

  // If we encounter persistent auth issues, show a recovery UI
  if (authTimeout && !isLoggedIn && !isLoginPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4 max-w-md text-center p-6 border rounded-lg shadow-md">
          <div className="bg-yellow-100 p-3 rounded-full">
            <RefreshCw className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold">Authentication Issue</h2>
          <p className="text-sm text-muted-foreground">
            We're having trouble verifying your login status. This could be due to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc text-left space-y-1">
            <li>Expired session</li>
            <li>Network connectivity problems</li>
            <li>Browser storage issues</li>
          </ul>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Button 
              onClick={handleManualRedirect}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
