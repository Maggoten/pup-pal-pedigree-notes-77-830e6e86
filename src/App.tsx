
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/reactQueryConfig';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { NetworkStatusProvider } from '@/providers/NetworkStatusProvider';
import Routes from './routes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NetworkStatusProvider>
            <BrowserRouter>
              <Routes />
              <Toaster />
            </BrowserRouter>
          </NetworkStatusProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
