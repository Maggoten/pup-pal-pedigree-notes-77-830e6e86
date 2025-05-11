import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./providers/AuthProvider";
import { getFirstActivePregnancy } from "./services/PregnancyService";
// ... (alla andra imports som i din nuvarande App.tsx)

const AppContent = () => {
  const { user } = useContext(AuthContext);
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
