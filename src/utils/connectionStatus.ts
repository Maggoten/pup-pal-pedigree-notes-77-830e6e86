
import { create } from 'zustand';

interface ConnectionState {
  isOnline: boolean;
  wasOffline: boolean;
  lastCheckedAt: number;
  checkConnection: () => boolean;
  setOnline: (online: boolean) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  isOnline: navigator.onLine,
  wasOffline: false,
  lastCheckedAt: Date.now(),
  
  checkConnection: () => {
    const online = navigator.onLine;
    const currentState = get().isOnline;
    
    // Update state if changed
    if (online !== currentState) {
      set({
        isOnline: online,
        wasOffline: !online || (!currentState && online), // Track if we were offline
        lastCheckedAt: Date.now()
      });
    } else {
      // Just update timestamp
      set({ lastCheckedAt: Date.now() });
    }
    
    return online;
  },
  
  setOnline: (online: boolean) => {
    set({
      isOnline: online,
      wasOffline: !online || (!get().isOnline && online),
      lastCheckedAt: Date.now()
    });
  }
}));

// Setup connection listeners
export const setupConnectionListeners = () => {
  const handleOnline = () => {
    useConnectionStore.getState().setOnline(true);
    console.log('Connection restored');
  };
  
  const handleOffline = () => {
    useConnectionStore.getState().setOnline(false);
    console.log('Connection lost');
  };
  
  // Add event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial check
  useConnectionStore.getState().checkConnection();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Set up ping to check real connectivity (not just browser online status)
export const startConnectionPing = (interval = 30000) => {
  // Function to ping an endpoint
  const pingEndpoint = async () => {
    try {
      // Use a tiny request to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      useConnectionStore.getState().setOnline(response.ok);
    } catch (error: any) {
      // If fetch fails, we're probably offline
      if (error.name !== 'AbortError') {
        useConnectionStore.getState().setOnline(false);
      }
    }
  };
  
  // Run initial ping
  pingEndpoint();
  
  // Set up interval
  const intervalId = setInterval(pingEndpoint, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Hook for components to use
export const useConnection = () => {
  const { isOnline, wasOffline, lastCheckedAt } = useConnectionStore();
  const checkConnection = useConnectionStore((state) => state.checkConnection);
  
  return {
    isOnline,
    wasOffline,
    lastCheckedAt,
    checkConnection
  };
};

// Initialize network monitoring
export const initNetworkMonitoring = () => {
  setupConnectionListeners();
  return startConnectionPing();
};
