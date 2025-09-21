
import { useState, useEffect } from 'react';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { useUpcomingHeatsContext } from '@/providers/UpcomingHeatsProvider';
import { useRecentMatings } from './useRecentMatings';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';

export const usePlannedLitterQueries = () => {
  const { dogs } = useDogs();
  const { user, isAuthReady } = useAuth();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  // Use centralized upcoming heats context instead of calculating here
  const { upcomingHeats } = useUpcomingHeatsContext();
  const { recentMatings, setRecentMatings } = useRecentMatings(plannedLitters);
  
  // Function to handle visibility change for reloading
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthReady && user) {
        // Reload data when page becomes visible again
        console.log('Page became visible, checking if planned litters need refresh');
        loadLitters(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthReady, user]);

  const loadLitters = async (isRefresh = false) => {
    // Skip if auth isn't ready yet
    if (!isAuthReady || !user) {
      console.log('Skipping planned litters load - auth not ready or no user');
      return;
    }

    if (loadAttempted && !isRefresh) {
      // Already tried loading once, don't spam attempts unless it's a refresh
      return;
    }
    
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
      setLoadAttempted(true);
      
      console.log("Loading planned litters with retry logic...");
      
      // Use fetchWithRetry with optimized delays for faster initial load
      const litters = await fetchWithRetry(
        () => plannedLittersService.loadPlannedLitters(),
        {
          maxRetries: isRefresh ? 3 : 2, // Fewer retries for initial load
          initialDelay: isRefresh ? 1500 : 300, // Much faster initial load, keep longer delays for refresh
          onRetry: (attempt) => {
            setRetryCount(attempt);
            console.log(`Retry attempt ${attempt} for loading planned litters`);
          }
        }
      );
      
      setPlannedLitters(litters);
      console.log("Planned litters loaded successfully:", litters.length);
    } catch (error) {
      console.error('Error loading planned litters:', error);
      
      // Check if error is auth-related
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isAuthError = ['401', 'JWT', 'auth', 'unauthorized', 'token'].some(code => 
        errorMsg.toLowerCase().includes(code.toLowerCase()));
      
      if (isAuthError) {
        console.warn('Auth-related error detected, not showing toast');
        // For auth errors, don't show toast as the auth system will handle it
      } else {
        toast({
          title: "Loading error",
          description: "Failed to load planned litters",
          variant: "destructive",
          action: {
            label: "Retry",
            onClick: () => {
              setLoadAttempted(false); // Allow retry
              loadLitters();
            },
            className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
          }
        });
      }
      
      // Set empty array as fallback
      setPlannedLitters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load planned litters when auth is ready
  useEffect(() => {
    if (isAuthReady && user) {
      loadLitters();
    }
  }, [isAuthReady, user]);

  // Add an effect to retry loading if needed after a timeout
  useEffect(() => {
    // If we have dogs but no litters, and we've already attempted to load, try once more
    if (!isLoading && dogs.length > 0 && plannedLitters.length === 0 && loadAttempted) {
      const timer = setTimeout(() => {
        console.log('Automatically retrying planned litters load after timeout');
        setLoadAttempted(false); // Reset the flag to allow another attempt
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, dogs.length, plannedLitters.length, loadAttempted]);

  return {
    plannedLitters,
    upcomingHeats,
    recentMatings,
    males,
    females,
    isLoading,
    setPlannedLitters,
    refreshLitters: () => loadLitters(true),
  };
};
