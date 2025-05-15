
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, parseISO } from 'date-fns';

/**
 * Calculate upcoming heats based on dogs' heat histories
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
          dog,
          expectedDate: nextHeatDate,
          daysTillHeat: Math.round((nextHeatDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          dogId: dog.id,
          dogName: dog.name,
          date: nextHeatDate
        });
      }
    }
  });
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.expectedDate.getTime() - b.expectedDate.getTime());
};
