
import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import MyDogs from './pages/MyDogs';
import MyLitters from './pages/MyLitters';
import PlannedLitters from './pages/PlannedLitters';
import Pregnancy from './pages/Pregnancy';
import PregnancyDetails from './pages/PregnancyDetails';
import Puppies from './pages/Puppies';
import NotFound from './pages/NotFound';
import AuthGuard from './components/AuthGuard';

const Routes: React.FC = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
      <Route path="/login" element={<Login />} />
      <Route path="/my-dogs" element={<AuthGuard><MyDogs /></AuthGuard>} />
      <Route path="/my-litters" element={<AuthGuard><MyLitters /></AuthGuard>} />
      <Route path="/planned-litters" element={<AuthGuard><PlannedLitters /></AuthGuard>} />
      <Route path="/pregnancy" element={<AuthGuard><Pregnancy /></AuthGuard>} />
      <Route path="/pregnancy/:id" element={<AuthGuard><PregnancyDetails /></AuthGuard>} />
      <Route path="/puppies" element={<AuthGuard><Puppies /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
