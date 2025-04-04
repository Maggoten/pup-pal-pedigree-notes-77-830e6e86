
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  // Check if user is on the login page
  const isLoginPage = location.pathname === '/login';

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
