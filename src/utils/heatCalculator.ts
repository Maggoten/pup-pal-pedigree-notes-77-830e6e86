
import { parseISO, addDays, isAfter } from 'date-fns';
import { Dog } from '@/types/dogs';
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
  
  console.log(`Calculating heat cycles for ${dogs.length} dogs, ${monthsAhead} months ahead`);
  
  // Filter for female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  console.log(`Found ${femaleDogs.length} female dogs`);
  
  femaleDogs.forEach(dog => {
    console.log(`Processing dog: ${dog.name}, heat history:`, dog.heatHistory);
    
    // Skip if no heat history
    if (!dog.heatHistory?.length) {
      console.log(`No heat history for ${dog.name}, skipping`);
      return;
    }
    
    const nextHeat = calculateNextHeatDate(dog);
    if (!nextHeat) return;
    
    // Add upcoming heats within the time period
    let nextHeatDate = nextHeat;
    
    while (isAfter(maxDate, nextHeatDate)) {
      if (isAfter(nextHeatDate, today)) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          date: nextHeatDate
        });
      }
      
      // Move to the next cycle
      const intervalDays = dog.heatInterval || 180;
      nextHeatDate = addDays(nextHeatDate, intervalDays);
    }
  });
  
  // Sort by date (earliest first)
  const sortedHeats = upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
  console.log(`Generated ${sortedHeats.length} upcoming heat events`);
  
  return sortedHeats;
};

/**
 * Calculate the next expected heat date for a female dog
 * @param dog The dog to calculate next heat date for
 * @returns Next expected heat date as Date object, or null if can't be calculated
 */
export const calculateNextHeatDate = (dog: Dog): Date | null => {
  if (!dog.heatHistory?.length) {
    console.log(`No heat history for ${dog.name}, can't calculate next heat date`);
    return null;
  }
  
  // Sort heat dates (newest first)
  const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get the most recent heat date
  const lastHeatDate = parseISO(sortedHeatDates[0].date);
  
  // Use the dog's heat interval if available, otherwise default to 180 days (6 months)
  const intervalDays = dog.heatInterval || 180;
  console.log(`Dog ${dog.name} has interval of ${intervalDays} days`);
  
  // Calculate next heat cycle
  const nextHeatDate = addDays(lastHeatDate, intervalDays);
  console.log(`Next heat date for ${dog.name}: ${nextHeatDate.toDateString()}`);
  
  return nextHeatDate;
};

// Re-export the UpcomingHeat type for backward compatibility
export type { UpcomingHeat };
