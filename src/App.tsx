
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Login page available to everyone */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
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
                    <Pregnancy />
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
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
