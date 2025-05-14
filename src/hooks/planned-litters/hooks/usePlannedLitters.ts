
import { useState, useEffect } from 'react';
import { usePlannedLitterQueries } from '@/hooks/planned-litters/hooks/usePlannedLitterQueries';
import { PlannedLitter } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for managing planned litters data
 */
export const usePlannedLitters = () => {
  const { user } = useAuth();
  const { 
    plannedLitters, 
    upcomingHeats, 
    isLoading, 
    refreshLitters 
  } = usePlannedLitterQueries();

  const [nextHeatDate, setNextHeatDate] = useState<Date | null>(null);
  
  // Find the next upcoming heat date
  useEffect(() => {
    if (upcomingHeats && upcomingHeats.length > 0) {
      // Sort heats by date, get the closest
      const sortedHeats = [...upcomingHeats].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      if (sortedHeats[0]) {
        setNextHeatDate(new Date(sortedHeats[0].date));
      }
    } else {
      // Check planned litters for expected heat dates
      const littersWithHeatDates = plannedLitters.filter(
        litter => litter.expectedHeatDate
      );
      
      if (littersWithHeatDates.length > 0) {
        // Sort by date and get earliest
        const sortedLitters = [...littersWithHeatDates].sort(
          (a, b) => new Date(a.expectedHeatDate).getTime() - new Date(b.expectedHeatDate).getTime()
        );
        
        if (sortedLitters[0]) {
          setNextHeatDate(new Date(sortedLitters[0].expectedHeatDate));
        }
      } else {
        setNextHeatDate(null);
      }
    }
  }, [plannedLitters, upcomingHeats]);

  return {
    plannedLitters,
    isLoading,
    refreshLitters,
    nextHeatDate
  };
};
