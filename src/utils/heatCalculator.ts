
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
  console.log(`Date range: ${minDate.toISOString()} to ${maxDate.toISOString()}`);
  
  // Filter for female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  console.log(`Found ${femaleDogs.length} female dogs`);
  
  femaleDogs.forEach(dog => {
    console.log(`Processing dog: ${dog.name}, heat history:`, dog.heatHistory);
    console.log(`Dog ${dog.name} has heat interval: ${dog.heatInterval} days`);
    
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
    console.log(`${dog.name}'s last heat date: ${lastHeatDate.toISOString()}`);
    
    // Use the dog's heat interval if available, otherwise default to 180 days (6 months)
    const intervalDays = dog.heatInterval || 180;
    console.log(`Dog ${dog.name} has interval of ${intervalDays} days`);
    
    // Generate both future and past heat cycles
    
    // First, calculate past heat events going backward from last recorded heat
    let pastHeatDate = new Date(lastHeatDate);
    console.log(`Starting backward calculation for ${dog.name} from ${pastHeatDate.toISOString()}`);
    
    // Include the last known heat date itself
    heatEvents.push({
      dogId: dog.id,
      dogName: dog.name,
      date: new Date(pastHeatDate)
    });
    
    // Generate past events by going backward
    let backwardCount = 0;
    while (pastHeatDate > minDate && backwardCount < 10) { // Limit to 10 cycles back to prevent infinite loops
      // Move backward one cycle
      pastHeatDate = addDays(pastHeatDate, -intervalDays);
      console.log(`Calculated past heat for ${dog.name}: ${pastHeatDate.toISOString()}`);
      
      // Add this heat date if it's in our time range
      if (pastHeatDate >= minDate) {
        heatEvents.push({
          dogId: dog.id,
          dogName: dog.name,
          date: new Date(pastHeatDate)
        });
        console.log(`Added past heat event for ${dog.name} on ${pastHeatDate.toISOString()}`);
      }
      backwardCount++;
    }
    
    // Then calculate future heat events going forward from last recorded heat
    let nextHeatDate = new Date(lastHeatDate);
    console.log(`Starting forward calculation for ${dog.name} from ${nextHeatDate.toISOString()}`);
    
    // Generate future events by going forward
    let forwardCount = 0;
    while (forwardCount < 10) { // Limit to 10 cycles forward to prevent infinite loops
      // Move forward one cycle
      nextHeatDate = addDays(nextHeatDate, intervalDays);
      console.log(`Calculated future heat for ${dog.name}: ${nextHeatDate.toISOString()}`);
      
      // Add this heat date if it's in our time range
      if (nextHeatDate <= maxDate) {
        heatEvents.push({
          dogId: dog.id,
          dogName: dog.name,
          date: new Date(nextHeatDate)
        });
        console.log(`Added future heat event for ${dog.name} on ${nextHeatDate.toISOString()}`);
      } else {
        // Stop if we're beyond our max date
        break;
      }
      forwardCount++;
    }
  });
  
  // Sort by date (earliest first)
  const sortedHeats = heatEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  console.log(`Generated ${sortedHeats.length} heat events (past and upcoming)`);
  
  // Log all generated events for debugging
  sortedHeats.forEach(event => {
    console.log(`Heat event: ${event.dogName} on ${event.date.toISOString()}`);
  });
  
  return sortedHeats;
};

// Re-export the UpcomingHeat type for backward compatibility
export type { UpcomingHeat };
