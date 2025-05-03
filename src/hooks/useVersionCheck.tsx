
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNetwork } from '@/providers/NetworkStatusProvider';
import { Button } from '@/components/ui/button';

const VERSION = '1.0.0'; // This should match your app version

export const useVersionCheck = () => {
  const { toast } = useToast();
  const { isOnline } = useNetwork();
  const [lastChecked, setLastChecked] = useState<number>(0);
  
  useEffect(() => {
    const checkVersion = async () => {
      // Only check once per session and when online
      if (!isOnline || lastChecked > 0) return;
      
      try {
        // This would typically hit an endpoint that returns the latest version
        // For now, we'll simulate with a local check
        const now = Date.now();
        const buildTimestamp = parseInt(process.env.BUILD_TIMESTAMP || '0', 10) || now;
        const timeSinceBuild = now - buildTimestamp;
        
        // If the app was built more than 24 hours ago, suggest a refresh
        if (timeSinceBuild > 24 * 60 * 60 * 1000) {
          console.log('App may be outdated, suggesting refresh');
          
          toast({
            title: "App Update Available",
            description: "Please refresh the page to get the latest version",
            action: (
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
                size="sm"
              >
                Refresh
              </Button>
            )
          });
        }
        
        setLastChecked(now);
      } catch (error) {
        console.error('Error checking for new version:', error);
      }
    };
    
    // Wait a bit before checking to prioritize core app loading
    const timeoutId = setTimeout(checkVersion, 5000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOnline, lastChecked, toast]);
  
  return {
    version: VERSION
  };
};
