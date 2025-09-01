
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyDogs from "./pages/MyDogs";
import PlannedLitters from "./pages/PlannedLitters";
import PregnancyDetails from "./pages/PregnancyDetails";
import MyLitters from "./pages/MyLitters";
import PuppyProfile from "./pages/PuppyProfile";
import Login from "./pages/Login";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import ResetPassword from "./pages/ResetPassword";
import AuthGuard from "./components/AuthGuard";
import { AuthProvider } from "./providers/AuthProvider";
import { DogsProvider } from "./context/DogsContext";
import { getFirstActivePregnancy } from "./services/PregnancyService";
import ErrorBoundary from "./components/ErrorBoundary";
import Pregnancy from "./pages/Pregnancy";
import MobileDebugPanel from "./components/diagnostics/MobileDebugPanel";
import { isMobileDevice, isAppForeground } from "./utils/fetchUtils";
import { queryClient, refreshOnVisibilityChange } from "./utils/reactQueryConfig";
import ProtectedApp from "./components/ProtectedApp";
import I18nProvider from "./providers/I18nProvider";

// RouteChangeTracker to detect navigation changes and refresh data
const RouteChangeTracker = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    // Only force refresh on POP (back/forward navigation) on mobile
    const isMobile = isMobileDevice();
    if (isMobile && navigationType === 'POP') {
      console.log(`[Navigation] Back navigation to ${location.pathname}, refreshing data`);
      
      // Invalidate key queries based on the current route
      if (location.pathname.includes('/my-litters')) {
        queryClient.invalidateQueries({ queryKey: ['litters'] });
      } else if (location.pathname.includes('/my-dogs')) {
        queryClient.invalidateQueries({ queryKey: ['dogs'] });
      } else if (location.pathname.includes('/pregnancy')) {
        queryClient.invalidateQueries({ queryKey: ['pregnancies'] });
      } else if (location.pathname.includes('/planned-litters')) {
        queryClient.invalidateQueries({ queryKey: ['planned_litters'] });
      }
    }
    
    // For all navigation types, log route change
    console.log(`[Navigation] Route changed to ${location.pathname} (${navigationType})`);
  }, [location, navigationType]);
  
  return null;
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
      if (isAppForeground()) {
        console.log(`[App Debug] App returned to foreground on ${deviceType}`);
        
        // Selectively refresh data based on common query keys
        refreshOnVisibilityChange([
          ['litters'],
          ['dogs'],
          ['pregnancies'],
          ['planned_litters']
        ]);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Monitor for network connectivity changes (important on mobile)
    window.addEventListener('online', () => {
      console.log('[App Debug] Network connection restored');
      // More aggressive cache invalidation when coming back online on mobile
      if (isMobileDevice()) {
        queryClient.invalidateQueries();
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('[App Debug] Network connection lost');
    });
    
    // Mobile-specific initialization
    if (isMobileDevice()) {
      // Add additional mobile-specific init code here
      console.log('[App Debug] Mobile-specific initialization complete');
    }
    
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
        <I18nProvider>
          <AuthProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGuard>
                <ProtectedApp>
                  <DogsProvider>
                    <RouteChangeTracker />
                    <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/registration-success" element={<RegistrationSuccess />} />
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
                    <Route path="/my-litters/:litterId/puppy/:puppyId" element={<PuppyProfile />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                    {/* Debug panel - moved back inside DogsProvider with conditional rendering */}
                    <ErrorBoundary fallback={<div />}>
                      <MobileDebugPanel />
                    </ErrorBoundary>
                  </DogsProvider>
              </ProtectedApp>
            </AuthGuard>
            </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
