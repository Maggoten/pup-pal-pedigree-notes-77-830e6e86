
import { parseISO, addDays, isAfter } from 'date-fns';
import { Dog } from '@/context/DogsContext';
import { UpcomingHeat } from '@/types/reminders';

/**
 * Calculate upcoming heat dates for female dogs
 * @param dogs List of all dogs
 * @param monthsAhead Number of months to look ahead (default: 6)
 * @returns Array of upcoming heat dates
 */
export const calculateUpcomingHeats = (dogs: Dog[], monthsAhead = 6): UpcomingHeat[] => {
  const today = new Date();
  const maxDate = addDays(today, monthsAhead * 30); // Approximate for months
  const upcomingHeats: UpcomingHeat[] = [];
  
  // Filter for female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  
  femaleDogs.forEach(dog => {
    // Skip if no heat history or interval
    if (!dog.heatHistory?.length || !dog.heatInterval) return;
    
    // Sort heat dates (newest first)
    const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get the most recent heat date
    const lastHeatDate = parseISO(sortedHeatDates[0].date);
    
    // Calculate next heat cycle
    let nextHeatDate = addDays(lastHeatDate, dog.heatInterval);
    
    // Add all upcoming heats within the time period
    while (isAfter(maxDate, nextHeatDate)) {
      if (isAfter(nextHeatDate, today)) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          date: nextHeatDate
        });
      }
      
      // Move to the next cycle
      nextHeatDate = addDays(nextHeatDate, dog.heatInterval);
    }
  });
  
  // Sort by date (earliest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};
