
import { useState, useEffect } from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { useDogs } from '@/context/DogsContext';
import { Dog } from '@/types/dogs';
import { syncHeatCycleEvents } from '@/services/ReminderCalendarSyncService';

export const useUpcomingHeats = () => {
  const { dogs } = useDogs();
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Use the existing calculateUpcomingHeats utility function
    const heats = calculateUpcomingHeats(dogs);
    setUpcomingHeats(heats);
    setLoading(false);
    
    // Now sync the heats with calendar events
    const syncHeatEvents = async () => {
      try {
        for (const heat of heats) {
          await syncHeatCycleEvents(heat);
        }
      } catch (error) {
        console.error('Error syncing heat calendar events:', error);
      }
    };
    
    // Don't block the UI, run this in the background
    syncHeatEvents();
  }, [dogs]);

  const refreshHeats = () => {
    const heats = calculateUpcomingHeats(dogs);
    setUpcomingHeats(heats);
    
    // Sync the refreshed heats with calendar events
    const syncHeatEvents = async () => {
      try {
        for (const heat of heats) {
          await syncHeatCycleEvents(heat);
        }
      } catch (error) {
        console.error('Error syncing heat calendar events on refresh:', error);
      }
    };
    
    // Don't block the UI, run this in the background
    syncHeatEvents();
  };

  return { upcomingHeats, loading, refreshHeats };
};
