import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  // Get the first active pregnancy ID for the pregnancy link
  const firstPregnancyId = getFirstActivePregnancy() || "none";
  
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
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
