
import { useState, useEffect } from 'react';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { useRecentMatings } from './useRecentMatings';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';

export const usePlannedLitterQueries = () => {
  const { dogs } = useDogs();
  const { user, isAuthReady } = useAuth();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [upcomingHeats, setUpcomingHeats] = useState(calculateUpcomingHeats([]));
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  const { recentMatings, setRecentMatings } = useRecentMatings(plannedLitters);
  
  useEffect(() => {
    const loadLitters = async () => {
      // Skip if auth isn't ready yet
      if (!isAuthReady || !user) {
        console.log('Skipping planned litters load - auth not ready or no user');
        return;
      }

      if (loadAttempted) {
        // Already tried loading once, don't spam attempts
        return;
      }
      
      try {
        setIsLoading(true);
        setLoadAttempted(true);
        
        console.log("Loading planned litters with retry logic...");
        
        // Use fetchWithRetry for more reliable loading
        const litters = await fetchWithRetry(
          () => plannedLittersService.loadPlannedLitters(),
          {
            maxRetries: 2,
            initialDelay: 2000,
            onRetry: (attempt) => {
              console.log(`Retry attempt ${attempt} for loading planned litters`);
            }
          }
        );
        
        setPlannedLitters(litters);
        console.log("Planned litters loaded successfully:", litters.length);
      } catch (error) {
        console.error('Error loading planned litters:', error);
        
        // Show toast with retry option using an action object instead of JSX
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
        
        // Set empty array as fallback
        setPlannedLitters([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load litters when auth is ready and we have a user
    if (isAuthReady && user) {
      loadLitters();
    }
    
    setUpcomingHeats(calculateUpcomingHeats(dogs));
  }, [dogs, isAuthReady, user, loadAttempted]);

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
  };
};
