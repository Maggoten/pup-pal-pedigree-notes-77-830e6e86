import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAuth();

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';

  console.log('AuthGuard:', { isLoggedIn, isLoading, isLoginPage, pathname: location.pathname });

  // Show minimal loader while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in and not on login page, redirect to login
  if (!isLoggedIn && !isLoginPage) {
    console.log('AuthGuard: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in and on login page, redirect to home
  if (isLoggedIn && isLoginPage) {
    console.log('AuthGuard: Redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default AuthGuard;
