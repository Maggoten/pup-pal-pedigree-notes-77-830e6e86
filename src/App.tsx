
import { useEffect, useState, useContext } from "react";
import { useAuth } from './hooks/useAuth';
import { getFirstActivePregnancy } from "./services/PregnancyService";
// ... (alla andra imports som i din nuvarande App.tsx)
import { Routes, Route, Navigate } from "react-router-dom";
import { Pregnancy } from "./pages/Pregnancy";

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
      {/* alla andra routes */}
    </Routes>
  );
};

// Export a default component
const App = () => {
  return <AppContent />;
};

export default App;
