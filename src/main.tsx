
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './utils/reactQueryConfig'
import { AuthProvider } from './providers/AuthProvider'
import { DogsProvider } from './context/DogsContext'
import App from './App.tsx'
import './index.css'

// Add global error handler for debugging mobile issues
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
  });
}

// Function to initialize the app with error handling
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found!");
      return;
    }
    
    createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DogsProvider>
            <App />
          </DogsProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
    console.log("[App] Successfully mounted React application");
  } catch (error) {
    console.error("[App] Failed to initialize React application:", error);
    
    // Fallback for critical errors
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 10px; background: #4f46e5; color: white; border: none; border-radius: 4px;">
            Refresh
          </button>
        </div>
      `;
    }
  }
};

// Initialize the application
initializeApp();
