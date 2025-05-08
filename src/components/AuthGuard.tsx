
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, supabaseUser, isAuthReady, isLoading } = useAuth();
  const { toast } = useToast();
  const [showingToast, setShowingToast] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';

  // Add a small delay before showing authentication errors
  // This helps prevent flash of auth errors during initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 500); // Short delay to allow auth to fully initialize
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Only show authentication toast when:
    // 1. Auth is fully ready
    // 2. User is not logged in
    // 3. Not on login page
    // 4. No user object exists
    // 5. Delay has completed (prevents flash)
    // 6. No toast is currently showing
    if (isAuthReady && !isLoggedIn && !isLoginPage && !supabaseUser && delayComplete && !showingToast) {
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
  }, [isLoggedIn, isLoginPage, supabaseUser, toast, isAuthReady, delayComplete, showingToast]);

  // Show loading state while auth is not ready
  if (!isAuthReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
