import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner"; // Inaktiverad
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyDogs from "./pages/MyDogs";
import PlannedLitters from "./pages/PlannedLitters";
import PregnancyDetails from "./pages/PregnancyDetails";
import MyLitters from "./pages/MyLitters";
import Login from "./pages/Login";
import AuthGuard from "./components/AuthGuard";
import { AuthProvider, AuthContext } from "./providers/AuthProvider";
import { DogsProvider } from "./context/DogsContext";
import { getFirstActivePregnancy } from "./services/PregnancyService";
import ErrorBoundary from "./components/ErrorBoundary";
import Pregnancy from "./pages/Pregnancy";
import MobileDebugPanel from "./components/diagnostics/MobileDebugPanel";
import { isMobileDevice } from "./utils/fetchUtils";
import { clearSessionState } from "./utils/auth/sessionManager";
import { queryClient } from "./utils/reactQueryConfig";

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const [firstPregnancyId, setFirstPregnancyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const deviceType = isMobileDevice() ? "Mobile" : "Desktop";

  useEffect(() => {
    console.log(`[App Debug] App initialized on ${deviceType}`);
    clearSessionState();

    const fetchFirstPregnancy = async () => {
      try {
        if (!user) return;
        const id = await getFirstActivePregnancy();
        setFirstPregnancyId(id);
      } catch (error) {
        console.error("[App Debug] Error fetching first pregnancy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPregnancy();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        queryClient.invalidateQueries();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleOnline = () => {
      if (user) {
        console.log("[App Debug] Network connection restored");
        queryClient.invalidateQueries();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", () =>
      console.log("[App Debug] Network connection lost")
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", () => {});
    };
  }, [user, deviceType]);

  return (
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthGuard>
          <DogsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/my-dogs" element={<MyDogs />} />
              <Route path="/planned-litters" element={<PlannedLitters />} />
              <Route
                path="/pregnancy"
                element={
                  loading ? (
                    <div>Loading...</div>
                  ) : firstPregnancyId ? (
                    <Navigate to={`/pregnancy/${firstPregnancyId}`} replace />
                  ) : (
                    <Pregnancy />
                  )
                }
              />
              <Route path="/pregnancy/:id" element={<PregnancyDetails />} />
              <Route path="/my-litters" element={<MyLitters />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileDebugPanel />
          </DogsProvider>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
