import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAuth();
  
  console.log('AuthGuard rendering:', { isLoggedIn, isLoading, path: location.pathname });
  
  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!isLoggedIn && location.pathname !== '/login') {
    console.log('AuthGuard: Not logged in, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in and on login page, redirect to home
  if (isLoggedIn && location.pathname === '/login') {
    console.log('AuthGuard: Already logged in, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default AuthGuard;
