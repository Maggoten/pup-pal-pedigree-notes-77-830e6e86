
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, supabaseUser, isAuthReady } = useAuth();
  const { toast } = useToast();

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    // Only show authentication toast when auth is fully ready
    // and user is not logged in and not on login page
    if (isAuthReady && !isLoggedIn && !isLoginPage && !supabaseUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive"
      });
    }
  }, [isLoggedIn, isLoginPage, supabaseUser, toast, isAuthReady]);

  // Show loading state while auth is not ready
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only redirect if auth is ready and user is not logged in and not on login page
  if (isAuthReady && !isLoggedIn && !isLoginPage) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only redirect if auth is ready and user is logged in and on login page
  if (isAuthReady && isLoggedIn && isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
