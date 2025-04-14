
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./hooks/useAuth";
import { DogsProvider } from "./context/DogsContext";
import { getFirstActivePregnancy } from "./services/PregnancyService";
import AuthGuard from "./components/AuthGuard";

// Lazy load non-critical pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyDogs = lazy(() => import("./pages/MyDogs"));
const PlannedLitters = lazy(() => import("./pages/PlannedLitters"));
const PregnancyDetails = lazy(() => import("./pages/PregnancyDetails"));
const MyLitters = lazy(() => import("./pages/MyLitters"));
const Login = lazy(() => import("./pages/Login"));

// Create QueryClient once to prevent recreation on renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  // Get the first active pregnancy ID for the pregnancy link
  const firstPregnancyId = getFirstActivePregnancy() || "none";
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <AuthGuard>
                <DogsProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/my-dogs" element={<MyDogs />} />
                    <Route path="/planned-litters" element={<PlannedLitters />} />
                    {/* Add a generic pregnancy route that redirects to the first active pregnancy or shows a message */}
                    <Route 
                      path="/pregnancy" 
                      element={
                        firstPregnancyId !== "none" ? 
                          <Navigate to={`/pregnancy/${firstPregnancyId}`} replace /> : 
                          <PregnancyDetails />
                      } 
                    />
                    <Route path="/pregnancy/:id" element={<PregnancyDetails />} />
                    <Route path="/my-litters" element={<MyLitters />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DogsProvider>
              </AuthGuard>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
