
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
import { AuthProvider } from "./providers/AuthProvider";
import { DogsProvider } from "./context/DogsContext";
import { getFirstActivePregnancy } from "./services/PregnancyService";
import ErrorBoundary from "./components/ErrorBoundary";
import Pregnancy from "./pages/Pregnancy";
import MobileDebugPanel from "./components/diagnostics/MobileDebugPanel";
import { isMobileDevice } from "./utils/fetchUtils";
import { clearSessionState } from "./utils/auth/sessionManager";

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: isMobileDevice() ? 3 : 2, // Increase retry count for mobile networks
      retryDelay: attempt => Math.min(1000 * Math.pow(2, attempt), 30000), // Exponential backoff
      // Use meta for error handling in newer versions of React Query
      meta: {
        onError: (error: Error) => {
          console.error('[React Query Error]:', error);
        }
      }
    }
  }
});

const App = () => {
  const [firstPregnancyId, setFirstPregnancyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  
  // Clear existing session state on app load
  useEffect(() => {
    console.log(`[App Debug] App initialized on ${deviceType}`);
    console.log(`[App Debug] User agent: ${navigator.userAgent}`);
    console.log(`[App Debug] Screen size: ${window.innerWidth}x${window.innerHeight}`);
    
    // Clear any leftover session state from previous runs
    clearSessionState();
    
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
        // Trigger fetch if needed when returning to app
        queryClient.invalidateQueries();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Monitor for network connectivity changes (important on mobile)
    window.addEventListener('online', () => {
      console.log('[App Debug] Network connection restored');
      queryClient.invalidateQueries();
    });
    
    window.addEventListener('offline', () => {
      console.log('[App Debug] Network connection lost');
    });
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
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
