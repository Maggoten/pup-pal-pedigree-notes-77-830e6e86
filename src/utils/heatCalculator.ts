
import { parseISO, addDays, isAfter, format, isValid } from 'date-fns';
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { parseISODate, getNormalizedToday } from '@/utils/dateUtils';

/**
 * Calculate upcoming heat dates for female dogs
 * @param dogs List of all dogs
 * @param monthsAhead Number of months to look ahead (default: 6)
 * @param monthsBehind Number of months to look behind (default: 12)
 * @returns Array of upcoming heat dates
 */
export const calculateUpcomingHeats = (dogs: Dog[], monthsAhead = 6, monthsBehind = 12): UpcomingHeat[] => {
  const today = getNormalizedToday(); // Use normalized today date at noon
  const maxDate = addDays(today, monthsAhead * 30); // Approximate for months ahead
  const minDate = addDays(today, -monthsBehind * 30); // Approximate for months behind
  const heatEvents: UpcomingHeat[] = [];
  
  console.log(`Calculating heat cycles for ${dogs.length} dogs, ${monthsAhead} months ahead and ${monthsBehind} months behind`);
  console.log(`Date range: ${format(minDate, 'yyyy-MM-dd')} to ${format(maxDate, 'yyyy-MM-dd')}`);
  
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
    
    try {
      // Sort heat dates (newest first)
      const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Get the most recent heat date
      const lastHeatDateString = sortedHeatDates[0].date;
      const lastHeatDate = parseISODate(lastHeatDateString);
      
      if (!lastHeatDate || !isValid(lastHeatDate)) {
        console.error(`Invalid last heat date for ${dog.name}: ${lastHeatDateString}`);
        return;
      }
      
      console.log(`${dog.name}'s last heat date: ${format(lastHeatDate, 'yyyy-MM-dd')}`);
      
      // Use the dog's heat interval if available, otherwise default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      console.log(`Dog ${dog.name} has interval of ${intervalDays} days`);
      
      // Generate both future and past heat cycles
      
      // First, calculate past heat events going backward from last recorded heat
      let pastHeatDate = new Date(lastHeatDate);
      console.log(`Starting backward calculation for ${dog.name} from ${format(pastHeatDate, 'yyyy-MM-dd')}`);
      
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
        console.log(`Calculated past heat for ${dog.name}: ${format(pastHeatDate, 'yyyy-MM-dd')}`);
        
        // Add this heat date if it's in our time range
        if (pastHeatDate >= minDate) {
          heatEvents.push({
            dogId: dog.id,
            dogName: dog.name,
            date: new Date(pastHeatDate)
          });
          console.log(`Added past heat event for ${dog.name} on ${format(pastHeatDate, 'yyyy-MM-dd')}`);
        }
        backwardCount++;
      }
      
      // Then calculate future heat events going forward from last recorded heat
      let nextHeatDate = new Date(lastHeatDate);
      console.log(`Starting forward calculation for ${dog.name} from ${format(nextHeatDate, 'yyyy-MM-dd')}`);
      
      // Generate future events by going forward
      let forwardCount = 0;
      while (forwardCount < 10) { // Limit to 10 cycles forward to prevent infinite loops
        // Move forward one cycle
        nextHeatDate = addDays(nextHeatDate, intervalDays);
        console.log(`Calculated future heat for ${dog.name}: ${format(nextHeatDate, 'yyyy-MM-dd')}`);
        
        // Add this heat date if it's in our time range
        if (nextHeatDate <= maxDate) {
          heatEvents.push({
            dogId: dog.id,
            dogName: dog.name,
            date: new Date(nextHeatDate)
          });
          console.log(`Added future heat event for ${dog.name} on ${format(nextHeatDate, 'yyyy-MM-dd')}`);
        } else {
          // Stop if we're beyond our max date
          break;
        }
        forwardCount++;
      }
    } catch (err) {
      console.error(`Error calculating heat cycles for ${dog.name}:`, err);
    }
  });
  
  // Sort by date (earliest first)
  const sortedHeats = heatEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  console.log(`Generated ${sortedHeats.length} heat events (past and upcoming)`);
  
  // Log all generated events for debugging
  sortedHeats.forEach(event => {
    console.log(`Heat event: ${event.dogName} on ${format(event.date, 'yyyy-MM-dd')}`);
  });
  
  return sortedHeats;
};

// Re-export the UpcomingHeat type for backward compatibility
export type { UpcomingHeat };
