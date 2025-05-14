
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, differenceInDays } from 'date-fns';

/**
 * Calculate upcoming heat dates for female dogs
 */
export const calculateUpcomingHeats = (dogs: Dog[]): UpcomingHeat[] => {
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  
  femaleDogs.forEach(dog => {
    // Skip if no heat cycle information is available
    if (!dog.heatCycle || !dog.heatCycle.interval || !dog.heatCycle.records || dog.heatCycle.records.length === 0) {
      return;
    }
    
    // Get the last heat date record
    const lastHeatDate = new Date(dog.heatCycle.records[dog.heatCycle.records.length - 1]);
    
    // Calculate next heat date based on the interval (in days)
    const nextHeatDate = addDays(lastHeatDate, dog.heatCycle.interval);
    
    // Only include if the heat date is in the future
    if (nextHeatDate > today) {
      const daysUntil = differenceInDays(nextHeatDate, today);
      
      upcomingHeats.push({
        id: `heat-${dog.id}-${nextHeatDate.getTime()}`,
        dogId: dog.id,
        dogName: dog.name,
        expectedDate: nextHeatDate,
        daysUntil: daysUntil,
        heatIndex: Math.floor(daysUntil / 7) + 1 // Heat index by weeks
      });
    }
  });
  
  // Sort by closest date first
  return upcomingHeats.sort((a, b) => a.daysUntil - b.daysUntil);
};
