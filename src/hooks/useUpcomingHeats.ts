
import { useState, useEffect, useCallback, useRef } from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeatsSafe } from '@/utils/heatCalculatorSafe';
import { useDogs } from '@/context/DogsContext';
import { Dog } from '@/types/dogs';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';

export const useUpcomingHeats = () => {
  const { dogs } = useDogs();
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCalculatingRef = useRef(false);

  const loadHeats = useCallback(async () => {
    // Prevent multiple concurrent calculations
    if (isCalculatingRef.current) {
      return;
    }
    
    isCalculatingRef.current = true;
    setLoading(true);
    
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    try {
      // Use the safe wrapper that can gradually migrate to unified method
      const heats = await calculateUpcomingHeatsSafe(dogs, 'upcomingHeats');
      setUpcomingHeats(heats);
      
      // Sync calendar events in background, but don't await it
      setTimeout(async () => {
        try {
          for (const heat of heats) {
            await ReminderCalendarSyncService.syncHeatCycleEvents(heat);
          }
        } catch (error) {
          console.error('Error syncing heat calendar events:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error calculating upcoming heats:', error);
      setUpcomingHeats([]); // Fallback to empty array
    } finally {
      // Use a minimum loading time to prevent flickering
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        isCalculatingRef.current = false;
      }, 300);
    }
  }, [dogs]);

  useEffect(() => {
    loadHeats();
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      isCalculatingRef.current = false;
    };
  }, [loadHeats]);

  const refreshHeats = useCallback(async () => {
    await loadHeats();
  }, [loadHeats]);

  return { upcomingHeats, loading, refreshHeats };
};
