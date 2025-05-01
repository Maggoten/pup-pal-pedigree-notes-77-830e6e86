
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Fix the import path
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

  // If still loading auth state, show a loading indicator instead of nothing
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
