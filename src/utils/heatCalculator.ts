
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, parseISO } from 'date-fns';
import { HeatService } from '@/services/HeatService';

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
      // Use dog's heat interval or default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      const nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      // Only include if the next heat date is in the future
      if (nextHeatDate > today) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          date: nextHeatDate,
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

      // Use dog's heat interval or default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      const nextHeatDate = addDays(latestDate, intervalDays);
      
      // Only include if the next heat date is in the future
      if (nextHeatDate > today) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          date: nextHeatDate,
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
        const intervalDays = dog.heatInterval || 180;
        const nextHeatDate = addDays(lastHeatDate, intervalDays);
        
        if (nextHeatDate > today) {
          upcomingHeats.push({
            dogId: dog.id,
            dogName: dog.name,
            date: nextHeatDate,
            heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date)
          });
        }
      }
    }
  }
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};
