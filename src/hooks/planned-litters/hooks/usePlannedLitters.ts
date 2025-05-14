
import { useState, useEffect, useMemo } from 'react';
import { PlannedLitter } from '@/types/breeding';
import { fetchPlannedLitters } from '@/services/planned-litters';
import { useUpcomingHeats } from '@/hooks/useUpcomingHeats';
import { useAuth } from '@/hooks/useAuth';

export const usePlannedLitters = () => {
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Get upcoming heat dates for dogs
  const { upcomingHeats } = useUpcomingHeats();
  
  // Determine the next heat date from either planned litters or upcoming heats
  const nextHeatDate = useMemo(() => {
    // First check planned litters
    const plannedHeatDates = plannedLitters
      .filter(litter => new Date(litter.expectedHeatDate) > new Date())
      .map(litter => new Date(litter.expectedHeatDate))
      .sort((a, b) => a.getTime() - b.getTime());
    
    // Then check upcoming heats
    const upcomingHeatDates = upcomingHeats
      .map(heat => new Date(heat.date))
      .sort((a, b) => a.getTime() - b.getTime());
    
    // Return the earliest date from either source
    const allDates = [...plannedHeatDates, ...upcomingHeatDates];
    return allDates.length > 0 ? allDates.sort((a, b) => a.getTime() - b.getTime())[0] : null;
  }, [plannedLitters, upcomingHeats]);
  
  // Load planned litters
  useEffect(() => {
    const loadPlannedLitters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const litters = await fetchPlannedLitters();
        setPlannedLitters(litters);
      } catch (err) {
        console.error('Error fetching planned litters:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch planned litters'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlannedLitters();
  }, [user]);
  
  return {
    plannedLitters,
    isLoading,
    error,
    nextHeatDate
  };
};
