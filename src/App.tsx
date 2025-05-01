
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { DogsProvider } from "./context/DogsContext";
import AuthGuard from "./components/AuthGuard";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MyDogs from "./pages/MyDogs";
import PlannedLitters from "./pages/PlannedLitters";
import PregnancyDetails from "./pages/PregnancyDetails";
import MyLitters from "./pages/MyLitters";
import Login from "./pages/Login";
import Pregnancy from "./pages/Pregnancy";

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
      meta: {
        onError: (error: Error) => {
          console.error('React Query error:', error);
        }
      }
    }
  }
});

const App = () => {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <DogsProvider>
                      <Index />
                    </DogsProvider>
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/my-dogs" 
                element={
                  <AuthGuard>
                    <DogsProvider>
                      <MyDogs />
                    </DogsProvider>
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/planned-litters" 
                element={
                  <AuthGuard>
                    <DogsProvider>
                      <PlannedLitters />
                    </DogsProvider>
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/pregnancy" 
                element={
                  <AuthGuard>
                    <DogsProvider>
                      <Pregnancy />
                    </DogsProvider>
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/pregnancy/:id" 
                element={
                  <AuthGuard>
                    <DogsProvider>
                      <PregnancyDetails />
                    </DogsProvider>
                  </AuthGuard>
                } 
              />
              
              <Route 
                path="/my-litters" 
                element={
                  <AuthGuard>
                    <DogsProvider>
                      <MyLitters />
                    </DogsProvider>
                  </AuthGuard>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
