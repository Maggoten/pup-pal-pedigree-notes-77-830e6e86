
import React, { createContext, useContext, useEffect, useState } from 'react';
import { networkStatusMonitor, isMobileDevice } from '@/utils/networkUtils';
import { toast } from '@/hooks/use-toast';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkContextType {
  isOnline: boolean;
  isMobile: boolean;
  hasSlowConnection: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isMobile: false,
  hasSlowConnection: false
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isMobile, setIsMobile] = useState<boolean>(isMobileDevice());
  const [hasSlowConnection, setHasSlowConnection] = useState<boolean>(false);
  
  // Set up connection monitoring
  useEffect(() => {
    // Check connection speed if supported
    // @ts-ignore - Navigator connection property not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const checkConnectionSpeed = () => {
      if (connection) {
        // Detect slow connections
        const isSlow = connection.type === 'cellular' || 
                     connection.effectiveType === 'slow-2g' || 
                     connection.effectiveType === '2g' || 
                     (connection.downlink && connection.downlink < 1);
        
        setHasSlowConnection(isSlow);
        
        if (isSlow) {
          console.log('Slow network detected, enabling low bandwidth optimizations', {
            type: connection.effectiveType,
            downlink: connection.downlink
          });
        }
      }
    };
    
    // Initial check
    checkConnectionSpeed();
    
    // Set up event listeners for connection changes
    if (connection) {
      connection.addEventListener('change', checkConnectionSpeed);
    }
    
    // Set up network status listener
    const handleNetworkStatusChange = (status: boolean) => {
      if (status !== isOnline) {
        setIsOnline(status);
        
        // Show toast only when status changes, not on initial load
        if (status) {
          toast({
            title: "Back online",
            description: "You're connected to the internet again",
            variant: "default",
          });
        } else {
          toast({
            title: "No connection",
            description: "You're currently offline. Some features may be limited.",
            variant: "destructive",
          });
        }
      }
    };
    
    networkStatusMonitor.addListener(handleNetworkStatusChange);
    
    return () => {
      networkStatusMonitor.removeListener(handleNetworkStatusChange);
      if (connection) {
        // @ts-ignore
        connection.removeEventListener('change', checkConnectionSpeed);
      }
    };
  }, [isOnline]);
  
  const contextValue = {
    isOnline,
    isMobile,
    hasSlowConnection
  };
  
  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};
