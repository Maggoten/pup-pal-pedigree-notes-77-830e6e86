import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ErrorBoundary from "./components/ErrorBoundary";
import Pregnancy from "./pages/Pregnancy";
import MobileDebugPanel from "./components/diagnostics/MobileDebugPanel";
import { queryClient } from "./utils/reactQueryConfig";

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
                    <Route path="/pregnancy" element={<Pregnancy />} />
                    <Route path="/pregnancy/:id" element={<PregnancyDetails />} />
                    <Route path="/my-litters" element={<MyLitters />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
