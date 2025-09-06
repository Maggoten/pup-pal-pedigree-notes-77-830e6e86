
import { useState, useEffect } from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeatsSafe } from '@/utils/heatCalculatorSafe';
import { useDogs } from '@/context/DogsContext';
import { Dog } from '@/types/dogs';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';

export const useUpcomingHeats = () => {
  const { dogs } = useDogs();
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHeats = async () => {
      setLoading(true);
      try {
        // Use the safe wrapper that can gradually migrate to unified method
        const heats = await calculateUpcomingHeatsSafe(dogs, 'upcomingHeats');
        setUpcomingHeats(heats);
        
        // Now sync the heats with calendar events
        const syncHeatEvents = async () => {
          try {
            for (const heat of heats) {
              await ReminderCalendarSyncService.syncHeatCycleEvents(heat);
            }
          } catch (error) {
            console.error('Error syncing heat calendar events:', error);
          }
        };
        
        // Don't block the UI, run this in the background
        syncHeatEvents();
      } catch (error) {
        console.error('Error calculating upcoming heats:', error);
        setUpcomingHeats([]); // Fallback to empty array
      }
      setLoading(false);
    };

    loadHeats();
  }, [dogs]);

  const refreshHeats = async () => {
    try {
      const heats = await calculateUpcomingHeatsSafe(dogs, 'upcomingHeats');
      setUpcomingHeats(heats);
      
      // Sync the refreshed heats with calendar events
      const syncHeatEvents = async () => {
        try {
          for (const heat of heats) {
            await ReminderCalendarSyncService.syncHeatCycleEvents(heat);
          }
        } catch (error) {
          console.error('Error syncing heat calendar events on refresh:', error);
        }
      };
      
      // Don't block the UI, run this in the background
      syncHeatEvents();
    } catch (error) {
      console.error('Error refreshing upcoming heats:', error);
    }
  };

  return { upcomingHeats, loading, refreshHeats };
};
