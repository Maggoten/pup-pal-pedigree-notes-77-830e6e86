
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
import { getActivePregnancies } from "./services/PregnancyService";
import Pregnancy from "./pages/Pregnancy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    },
  },
});

const App = () => {
  return (
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
                  <Route path="/pregnancy" element={<Pregnancy />} />
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
  );
};

export default App;
