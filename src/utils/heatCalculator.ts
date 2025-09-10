
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, parseISO } from 'date-fns';
import { HeatService } from '@/services/HeatService';
import { calculateOptimalHeatInterval } from '@/utils/heatIntervalCalculator';

/**
 * Calculate upcoming heats based on dogs' heat histories (legacy version)
 */
export const calculateUpcomingHeats = (dogs: Dog[]): UpcomingHeat[] => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  
  // Filter for female dogs with heat history
  const femaleDogs = dogs.filter(dog => 
    dog.gender === 'female' && 
    dog.heatHistory && 
    dog.heatHistory.length > 0
  );
  
  femaleDogs.forEach(dog => {
    // Sort heat history by date (most recent first)
    const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedHeatDates.length > 0) {
      const lastHeatDate = parseISO(sortedHeatDates[0].date);
      // Calculate optimal interval from heat history, default to 365 days (1 year)
      const heatDates = dog.heatHistory?.map(h => parseISO(h.date)) || [];
      const intervalDays = calculateOptimalHeatInterval(heatDates);
      let nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      // Handle overdue heats - recalculate to next future cycle
      if (nextHeatDate <= today) {
        const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
        const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
        nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
      }
      
      // Now we always include since we've ensured the date is in the future
      if (nextHeatDate > today) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          dogImageUrl: dog.image,
          date: nextHeatDate,
          lastHeatDate: lastHeatDate,
          source: 'predicted' as const,
          heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date) // Store the index for deletion
        });
      }
    }
  });
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculate upcoming heats using unified data from both systems
 * This will be the preferred method in Step 5
 */
export const calculateUpcomingHeatsUnified = async (dogs: Dog[]): Promise<UpcomingHeat[]> => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  
  // Filter for female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  
  for (const dog of femaleDogs) {
    try {
      const latestDate = await HeatService.getLatestHeatDate(dog.id);
      if (!latestDate) continue;

      // Use dog's heat interval or default to 365 days (1 year)
      const intervalDays = dog.heatInterval || 365;
      let nextHeatDate = addDays(latestDate, intervalDays);
      
      // Handle overdue heats in unified calculation
      if (nextHeatDate <= today) {
        const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
        const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
        nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
      }
      
      // Only include if the next heat date is in the future
      if (nextHeatDate > today) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          dogImageUrl: dog.image,
          date: nextHeatDate,
          lastHeatDate: latestDate,
          source: 'predicted' as const,
          heatIndex: -1 // Not used in unified system
        });
      }
    } catch (error) {
      console.error(`Error calculating upcoming heat for dog ${dog.id}:`, error);
      // Fall back to legacy calculation for this dog
      if (dog.heatHistory && dog.heatHistory.length > 0) {
        const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const lastHeatDate = parseISO(sortedHeatDates[0].date);
        const intervalDays = dog.heatInterval || 365;
        let nextHeatDate = addDays(lastHeatDate, intervalDays);
        
        // Handle overdue heats in fallback logic too
        if (nextHeatDate <= today) {
          const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
          const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
          nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
        }
        
        if (nextHeatDate > today) {
          upcomingHeats.push({
            dogId: dog.id,
            dogName: dog.name,
            dogImageUrl: dog.image,
            date: nextHeatDate,
            lastHeatDate: lastHeatDate,
            source: 'predicted' as const,
            heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date)
          });
        }
      }
    }
  }
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};
