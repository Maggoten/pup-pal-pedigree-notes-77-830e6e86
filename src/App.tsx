
import { useEffect, useState } from "react";
import { useAuth } from './hooks/useAuth';
import { getFirstActivePregnancy } from "./services/PregnancyService";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DogsProvider } from './context/DogsContext';
import Index from './pages/Index';
import MyDogs from './pages/MyDogs';
import PlannedLitters from './pages/PlannedLitters';
import Pregnancy from './pages/Pregnancy';
import PregnancyDetails from './pages/PregnancyDetails';
import MyLitters from './pages/MyLitters';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

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
    <DogsProvider>
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
    </DogsProvider>
  );
};

// Export a default component
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
