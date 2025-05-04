
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyDogs from "./pages/MyDogs";
import PlannedLitters from "./pages/PlannedLitters";
import PregnancyDetails from "./pages/PregnancyDetails";
import MyLitters from "./pages/MyLitters";
import Login from "./pages/Login";
import AuthGuard from "./components/AuthGuard";
import { AuthProvider } from "./hooks/useAuth";
import { DogsProvider } from "./context/DogsContext";
import { getFirstActivePregnancy } from "./services/PregnancyService";
import ErrorBoundary from "./components/ErrorBoundary";
import Pregnancy from "./pages/Pregnancy";
import MobileDebugPanel from "./components/diagnostics/MobileDebugPanel";

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Increase retry count for mobile networks
      // Use meta for error handling in newer versions of React Query
      meta: {
        onError: (error: Error) => {
          console.error('[React Query Error]:', error);
        }
      }
    }
  }
});

// Detect if we're on mobile for logging purposes
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const App = () => {
  const [firstPregnancyId, setFirstPregnancyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  
  useEffect(() => {
    console.log(`[App Debug] App initialized on ${deviceType}`);
    console.log(`[App Debug] User agent: ${navigator.userAgent}`);
    console.log(`[App Debug] Screen size: ${window.innerWidth}x${window.innerHeight}`);
    
    const fetchFirstPregnancy = async () => {
      try {
        console.log(`[App Debug] Fetching first pregnancy`);
        const id = await getFirstActivePregnancy();
        console.log(`[App Debug] First pregnancy ID: ${id || 'none'}`);
        setFirstPregnancyId(id);
      } catch (error) {
        console.error("[App Debug] Error fetching first pregnancy:", error);
      } finally {
        console.log(`[App Debug] Initial loading complete`);
        setLoading(false);
      }
    };
    
    fetchFirstPregnancy();
    
    // Add listener for window focus to detect app returning to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log(`[App Debug] App returned to foreground on ${deviceType}`);
        // Could trigger data refreshes here when app returns to foreground
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [deviceType]);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGuard>
                <DogsProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/my-dogs" element={<MyDogs />} />
                    <Route path="/planned-litters" element={<PlannedLitters />} />
                    {/* Handle pregnancy routes with loading state */}
                    <Route path="/pregnancy" element={loading ? <div>Loading...</div> : 
                      firstPregnancyId ? 
                        <Navigate to={`/pregnancy/${firstPregnancyId}`} replace /> : 
                        <Pregnancy />
                    } />
                    <Route path="/pregnancy/:id" element={<PregnancyDetails />} />
                    <Route path="/my-litters" element={<MyLitters />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Add the debug panel - only shown in development on mobile */}
                  <MobileDebugPanel />
                </DogsProvider>
              </AuthGuard>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
