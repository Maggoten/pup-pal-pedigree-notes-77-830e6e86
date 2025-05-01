
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

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Use meta for error handling in newer versions of React Query
      meta: {
        onError: (error: Error) => {
          console.error('React Query error:', error);
        }
      }
    }
  }
});

const App = () => {
  const [firstPregnancyId, setFirstPregnancyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFirstPregnancy = async () => {
      try {
        const id = await getFirstActivePregnancy();
        setFirstPregnancyId(id);
      } catch (error) {
        console.error("Error fetching first pregnancy:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFirstPregnancy();
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <AuthGuard>
                    <DogsProvider>
                      <Index />
                    </DogsProvider>
                  </AuthGuard>
                } />
                <Route path="/my-dogs" element={
                  <AuthGuard>
                    <DogsProvider>
                      <MyDogs />
                    </DogsProvider>
                  </AuthGuard>
                } />
                <Route path="/planned-litters" element={
                  <AuthGuard>
                    <DogsProvider>
                      <PlannedLitters />
                    </DogsProvider>
                  </AuthGuard>
                } />
                <Route path="/pregnancy" element={
                  <AuthGuard>
                    <DogsProvider>
                      {loading ? <div>Loading...</div> : 
                        firstPregnancyId ? 
                          <Navigate to={`/pregnancy/${firstPregnancyId}`} replace /> : 
                          <Pregnancy />
                      }
                    </DogsProvider>
                  </AuthGuard>
                } />
                <Route path="/pregnancy/:id" element={
                  <AuthGuard>
                    <DogsProvider>
                      <PregnancyDetails />
                    </DogsProvider>
                  </AuthGuard>
                } />
                <Route path="/my-litters" element={
                  <AuthGuard>
                    <DogsProvider>
                      <MyLitters />
                    </DogsProvider>
                  </AuthGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
