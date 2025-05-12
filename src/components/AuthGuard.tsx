
import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { verifySession } from '@/utils/auth/sessionManager';

let activeUploadsCount = 0;

export const uploadStateManager = {
  incrementUploads: () => activeUploadsCount++,
  decrementUploads: () => { if (activeUploadsCount > 0) activeUploadsCount--; },
  getActiveUploads: () => activeUploadsCount,
  hasActiveUploads: () => activeUploadsCount > 0
};

let authDuringUpload = {
  wasAuthenticated: false,
  pendingUpload: false
};

export const setUploadPending = (isPending: boolean) => {
  authDuringUpload.pendingUpload = isPending;
  if (isPending) {
    authDuringUpload.wasAuthenticated = true;
  } else {
    setTimeout(() => {
      authDuringUpload.wasAuthenticated = false;
    }, 3000);
  }
};

export const shouldPreserveAuth = () =>
  authDuringUpload.pendingUpload ||
  (authDuringUpload.wasAuthenticated && activeUploadsCount > 0);

let manualLogoutInProgress = false;
export const setManualLogout = (inProgress: boolean) => {
  manualLogoutInProgress = inProgress;
};

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, supabaseUser, isAuthReady, isLoading } = useAuth();
  const { toast } = useToast();

  const [delayComplete, setDelayComplete] = useState(false);
  const [showingToast, setShowingToast] = useState(false);
  const [hasActiveUploads, setHasActiveUploads] = useState(false);
  const [isManualLogout, setIsManualLogout] = useState(false);
  const [mobileAuthTimeout, setMobileAuthTimeout] = useState(false);

  const platform = getPlatformInfo();
  const isMobile = platform.mobile || platform.safari;
  const isLoginPage = location.pathname === '/login';
  
  console.log('[AuthGuard] Rendering with:', {
    isAuthReady,
    isLoggedIn,
    isLoading,
    userId: supabaseUser?.id,
    currentPath: location.pathname,
    isMobile,
    hasActiveUploads
  });

  useEffect(() => {
    setIsManualLogout(manualLogoutInProgress);
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHasActiveUploads(uploadStateManager.hasActiveUploads());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, isMobile ? 3000 : 500);
    return () => clearTimeout(timer);
  }, [isMobile]);

  // ✅ Named mobile timeout verifier
  useEffect(() => {
    if (!isMobile || isLoggedIn || isLoginPage || hasActiveUploads) return;

    const verify = async () => {
      try {
        const isValid = await verifySession({ skipThrow: true });
        if (!isValid && isAuthReady) setMobileAuthTimeout(true);
      } catch {
        setMobileAuthTimeout(true);
      }
    };

    const timer = setTimeout(() => verify(), 5000);
    return () => clearTimeout(timer);
  }, [isMobile, isLoggedIn, isLoginPage, isAuthReady, hasActiveUploads]);

  // ✅ Named online/offline listeners
  useEffect(() => {
    const onOnline = () => console.log('[AuthGuard] Online');
    const onOffline = () => console.log('[AuthGuard] Offline');

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const shouldRedirectToLogin = useMemo(() => {
    const shouldRedirect = isAuthReady && 
      !isLoggedIn &&
      !isLoginPage &&
      (!isMobile || mobileAuthTimeout) &&
      !hasActiveUploads &&
      !shouldPreserveAuth();
    
    console.log('[AuthGuard] shouldRedirectToLogin:', shouldRedirect);
    return shouldRedirect;
  }, [
    isAuthReady,
    isLoggedIn,
    isLoginPage,
    isMobile,
    mobileAuthTimeout,
    hasActiveUploads
  ]);

  const shouldShowToast = useMemo(() => {
    const shouldShow = isAuthReady &&
      !isLoggedIn &&
      !isLoginPage &&
      !supabaseUser &&
      delayComplete &&
      !showingToast &&
      (!isMobile || mobileAuthTimeout) &&
      !hasActiveUploads &&
      !shouldPreserveAuth() &&
      !isManualLogout;
    
    console.log('[AuthGuard] shouldShowToast:', shouldShow);
    return shouldShow;
  }, [
    isAuthReady,
    isLoggedIn,
    isLoginPage,
    supabaseUser,
    delayComplete,
    showingToast,
    isMobile,
    mobileAuthTimeout,
    hasActiveUploads,
    isManualLogout
  ]);

  useEffect(() => {
    if (shouldShowToast) {
      setShowingToast(true);

      toast({
        title: "Authentication required",
        description: isMobile
          ? "Please log in to continue. If you were previously logged in, please try refreshing the page."
          : "Please log in to access this page",
        variant: "destructive",
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/login")
        },
        onOpenChange: (open) => {
          if (!open) setShowingToast(false);
        }
      });
    }
  }, [shouldShowToast, toast, isMobile]);

  // ✅ Endast ett loader-block
  if (!isAuthReady || isLoading) {
    console.log('[AuthGuard] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (isManualLogout) return <>{children}</>;
  if (shouldRedirectToLogin) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isLoggedIn && isLoginPage) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AuthGuard;
