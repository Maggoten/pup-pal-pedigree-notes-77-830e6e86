
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

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
    
    createRoot(rootElement).render(<App />);
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
