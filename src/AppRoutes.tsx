
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy-loaded page components for better performance
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const MyDogs = lazy(() => import('./pages/MyDogs'));
const MyLitters = lazy(() => import('./pages/MyLitters'));
const PlannedLitters = lazy(() => import('./pages/PlannedLitters'));
const Pregnancy = lazy(() => import('./pages/Pregnancy'));
const PregnancyDetails = lazy(() => import('./pages/PregnancyDetails'));
const Puppies = lazy(() => import('./pages/Puppies'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppRoutes: React.FC = () => {
  const { isLoggedIn, isAuthReady } = useAuth();

  // Show loading state while auth is being checked
  if (!isAuthReady) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/my-dogs" 
          element={isLoggedIn ? <MyDogs /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/my-litters" 
          element={isLoggedIn ? <MyLitters /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/planned-litters" 
          element={isLoggedIn ? <PlannedLitters /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/pregnancy" 
          element={isLoggedIn ? <Pregnancy /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/pregnancy/:id" 
          element={isLoggedIn ? <PregnancyDetails /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/puppies" 
          element={isLoggedIn ? <Puppies /> : <Navigate to="/login" replace />} 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
