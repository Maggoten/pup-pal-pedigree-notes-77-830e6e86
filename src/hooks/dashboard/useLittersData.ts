
import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { litterService } from '@/services/LitterService';

export interface PlannedLittersData {
  count: number;
  nextDate: Date | null;
}

export interface RecentLittersData {
  count: number;
  latest: Date | null;
}

export const useLittersData = () => {
  const [plannedLittersData, setPlannedLittersData] = useState<PlannedLittersData>({ 
    count: 0, 
    nextDate: null 
  });
  const [recentLittersData, setRecentLittersData] = useState<RecentLittersData>({ 
    count: 0, 
    latest: null 
  });
  const [littersLoaded, setLittersLoaded] = useState<boolean>(false);

  // Fetch planned litters data
  useEffect(() => {
    const fetchPlannedLittersData = async () => {
      try {
        console.log("Fetching planned litters data...");
        const plannedLitters = await plannedLittersService.loadPlannedLitters();
        
        // Sort planned litters by expected heat date to find the next one
        const sortedLitters = [...plannedLitters].sort(
          (a, b) => new Date(a.expectedHeatDate).getTime() - new Date(b.expectedHeatDate).getTime()
        );
        
        // Find the next planned litter (with heat date in the future)
        const nextLitter = sortedLitters.find(
          litter => new Date(litter.expectedHeatDate).getTime() > Date.now()
        );
        
        setPlannedLittersData({
          count: plannedLitters.length,
          nextDate: nextLitter ? new Date(nextLitter.expectedHeatDate) : null
        });
        
        console.log("Planned litters data loaded:", plannedLitters.length);
      } catch (error) {
        console.error('Error fetching planned litters:', error);
        setPlannedLittersData({ count: 0, nextDate: null });
      }
    };
    
    fetchPlannedLittersData();
  }, []);
  
  // Fetch recent litters data
  useEffect(() => {
    const fetchRecentLittersData = async () => {
      try {
        console.log("Fetching recent litters data...");
        // Get all litters
        const activeLitters = await litterService.getActiveLitters();
        const archivedLitters = await litterService.getArchivedLitters();
        const allLitters = [...activeLitters, ...archivedLitters];
        
        // Consider litters from the last 90 days as "recent"
        const ninetyDaysAgo = subDays(new Date(), 90);
        const recentLitters = allLitters.filter(
          litter => new Date(litter.dateOfBirth) >= ninetyDaysAgo
        );
        
        // Find the most recent litter
        let latestDate: Date | null = null;
        if (recentLitters.length > 0) {
          const sortedLitters = [...recentLitters].sort(
            (a, b) => new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime()
          );
          latestDate = sortedLitters[0] ? new Date(sortedLitters[0].dateOfBirth) : null;
        }
        
        setRecentLittersData({
          count: recentLitters.length,
          latest: latestDate
        });
        
        console.log("Recent litters data loaded:", recentLitters.length);
        setLittersLoaded(true);
      } catch (error) {
        console.error('Error fetching recent litters:', error);
        setRecentLittersData({ count: 0, latest: null });
        // Even with an error, we still consider litters loaded to avoid blocking the UI
        setLittersLoaded(true);
      }
    };
    
    fetchRecentLittersData();
  }, []);

  return {
    plannedLittersData,
    recentLittersData,
    littersLoaded
  };
};
