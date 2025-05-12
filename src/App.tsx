
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/reactQueryConfig';
import { AuthProvider } from './providers/AuthProvider';
import { DogsProvider } from './context/DogsContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { getFirstActivePregnancy } from "./services/PregnancyService";
import { useState, useEffect } from "react";

// Import all pages
import Index from './pages/Index';
import MyDogs from './pages/MyDogs';
import PlannedLitters from './pages/PlannedLitters';
import Pregnancy from './pages/Pregnancy';
import PregnancyDetails from './pages/PregnancyDetails';
import MyLitters from './pages/MyLitters';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Create a separate component for the routes to access hooks
const AppContent = () => {
  const { user } = useAuth();
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

    fetchPregnancy();
  }, [user]);

  return (
    <Routes>
      <Route path="/pregnancy" element={
        firstPregnancyId
          ? <Navigate to={`/pregnancy/${firstPregnancyId}`} replace />
          : <Pregnancy />
      } />
      {/* all other routes */}
      <Route path="/" element={<Index />} />
      <Route path="/my-dogs" element={<MyDogs />} />
      <Route path="/planned-litters" element={<PlannedLitters />} />
      <Route path="/pregnancy/:id" element={<PregnancyDetails />} />
      <Route path="/my-litters" element={<MyLitters />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Updated App component with proper provider hierarchy
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DogsProvider>
            <AppContent />
          </DogsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
