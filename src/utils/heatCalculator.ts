
import { parseISO, addDays, isAfter } from 'date-fns';
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';

/**
 * Calculate upcoming heat dates for female dogs
 * @param dogs List of all dogs
 * @param monthsAhead Number of months to look ahead (default: 6)
 * @param monthsBehind Number of months to look behind (default: 12)
 * @returns Array of upcoming heat dates
 */
export const calculateUpcomingHeats = (dogs: Dog[], monthsAhead = 6, monthsBehind = 12): UpcomingHeat[] => {
  const today = new Date();
  const maxDate = addDays(today, monthsAhead * 30); // Approximate for months ahead
  const minDate = addDays(today, -monthsBehind * 30); // Approximate for months behind
  const heatEvents: UpcomingHeat[] = [];
  
  console.log(`Calculating heat cycles for ${dogs.length} dogs, ${monthsAhead} months ahead and ${monthsBehind} months behind`);
  
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
    
    // Sort heat dates (newest first)
    const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get the most recent heat date
    const lastHeatDate = parseISO(sortedHeatDates[0].date);
    
    // Use the dog's heat interval if available, otherwise default to 180 days (6 months)
    const intervalDays = dog.heatInterval || 180;
    console.log(`Dog ${dog.name} has interval of ${intervalDays} days`);
    
    // Calculate next heat cycle (going forward)
    let nextHeatDate = new Date(lastHeatDate);
    
    // First, go backward from the last heat date to include past events
    let pastHeatDate = new Date(lastHeatDate);
    while (pastHeatDate > minDate) {
      // Add this heat date if it's in our time range
      if (pastHeatDate >= minDate) {
        heatEvents.push({
          dogId: dog.id,
          dogName: dog.name,
          date: new Date(pastHeatDate)
        });
      }
      
      // Move backward one cycle
      pastHeatDate = addDays(pastHeatDate, -intervalDays);
    }
    
    // Then go forward from the last heat date to include future events
    while (nextHeatDate <= maxDate) {
      // Add this heat date if it's in the future
      if (nextHeatDate <= maxDate) {
        heatEvents.push({
          dogId: dog.id,
          dogName: dog.name,
          date: new Date(nextHeatDate)
        });
      }
      
      // Move forward one cycle
      nextHeatDate = addDays(nextHeatDate, intervalDays);
    }
  });
  
  // Sort by date (earliest first)
  const sortedHeats = heatEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  console.log(`Generated ${sortedHeats.length} heat events (past and upcoming)`);
  
  return sortedHeats;
};

// Re-export the UpcomingHeat type for backward compatibility
export type { UpcomingHeat };
