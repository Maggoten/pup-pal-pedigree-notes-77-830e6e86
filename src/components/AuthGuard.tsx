
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, isLoading, supabaseUser } = useAuth();
  const { toast } = useToast();

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (!isLoggedIn && !isLoginPage && !supabaseUser && !isLoading) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive"
      });
    }
  }, [isLoggedIn, isLoginPage, supabaseUser, isLoading, toast]);

  // If still loading auth state, show nothing to prevent flashes
  if (isLoading) {
    return null;
  }

  // If not logged in and not on login page, redirect to login
  if (!isLoggedIn && !isLoginPage) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in and on login page, redirect to home
  if (isLoggedIn && isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
