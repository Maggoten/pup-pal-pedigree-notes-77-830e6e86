import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/reactQueryConfig';
import { AuthProvider } from './providers/AuthProvider';
import { DogsProvider } from './context/DogsContext';
import { useAuth } from './hooks/useAuth';
import { getFirstActivePregnancy } from "./services/PregnancyService";
import { useState, useEffect } from "react";
import { Loader2 } from 'lucide-react';

// Pages
import Index from './pages/Index';
import MyDogs from './pages/MyDogs';
import PlannedLitters from './pages/PlannedLitters';
import Pregnancy from './pages/Pregnancy';
import PregnancyDetails from './pages/PregnancyDetails';
import MyLitters from './pages/MyLitters';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const AppContent = () => {
  const { user, isAuthReady } = useAuth();
  const [firstPregnancyId, setFirstPregnancyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPregnancy = async () => {
      if (!user) return;
      try {
        const id = await getFirstActivePregnancy();
        setFirstPregnancyId(id);
      } catch (err) {
        console.error("Failed to fetch active pregnancy:", err);
      }
    };

    if (isAuthReady && user) {
      fetchPregnancy();
    }
  }, [user, isAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Laddar autentisering...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/my-dogs" element={<MyDogs />} />
      <Route path="/planned-litters" element={<PlannedLitters />} />
      <Route
        path="/pregnancy"
        element={
          firstPregnancyId
            ? <Navigate to={`/pregnancy/${firstPregnancyId}`} replace />
            : <Pregnancy />
        }
      />
      <Route path="/pregnancy/:id" element={<PregnancyDetails />} />
      <Route path="/my-litters" element={<MyLitters />} />
      <Route path="*" element*
