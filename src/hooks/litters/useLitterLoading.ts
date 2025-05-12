
// This is a simplified file to fix TypeScript errors

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import { fetchWithRetry } from '@/utils/fetchUtils';

export const useLitterLoading = (loadFunction: () => Promise<Litter[]>) => {
  const [isLoading, setIsLoading] = useState(true);
  const [litters, setLitters] = useState<Litter[]>([]);
  
  const loadLitters = async () => {
    setIsLoading(true);
    
    try {
      const fetchedLitters = await fetchWithRetry(
        loadFunction,
        {
          maxRetries: 2,
          initialDelay: 1000,
          onRetry: (attempt) => {
            console.log(`Retry attempt ${attempt} for loading litters`);
          }
        }
      );
      
      // Ensure fetchedLitters is properly typed
      const typedLitters = fetchedLitters as Litter[];
      setLitters(typedLitters);
      console.log(`Loaded ${typedLitters.length} litters`);
    } catch (error) {
      console.error('Error loading litters:', error);
      
      // Check if error is auth-related
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isAuthError = ['401', 'JWT', 'auth', 'unauthorized', 'token'].some(code => 
        errorMsg.toLowerCase().includes(code.toLowerCase()));
      
      if (!isAuthError) {
        toast({
          title: "Loading error",
          description: "Failed to load litters. Please try refreshing.",
          variant: "destructive",
          action: {
            label: "Refresh",
            onClick: loadLitters,
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadLitters();
  }, []);

  return {
    isLoading,
    litters,
    refreshLitters: loadLitters,
  };
};
