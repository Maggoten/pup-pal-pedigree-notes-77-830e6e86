
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import { ThemeProvider } from './components/providers/theme-provider';
import { initNetworkMonitoring } from './utils/connectionStatus';
import { optimizeQueriesForOffline } from './utils/reactQueryConfig';
import { isMobileDevice } from './utils/fetchUtils';
import { preloadSessionData } from './utils/storage/core/session';

function App() {
  // Initialize network monitoring
  useEffect(() => {
    // Initialize network monitoring
    const cleanup = initNetworkMonitoring();
    
    // Preload session data for mobile
    if (isMobileDevice()) {
      preloadSessionData();
      optimizeQueriesForOffline();
    }
    
    return cleanup;
  }, []);
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
