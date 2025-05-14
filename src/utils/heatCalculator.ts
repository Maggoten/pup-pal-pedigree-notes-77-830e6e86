import { Dog } from '@/types/dogs';
import { addMonths, differenceInDays, format, isPast } from 'date-fns';

// Calculate the expected heat date based on the dog's last heat and heat cycle
export const calculateExpectedHeatDate = (dog: Dog): Date => {
  const lastHeatDate = dog.lastHeat;
  const heatCycle = calculateHeatCycle(dog);

  if (!lastHeatDate || !heatCycle) {
    return addMonths(new Date(), 6); // Default 6 months if no data
  }

  const expectedHeatDate = addMonths(new Date(lastHeatDate), heatCycle / 30);
  return expectedHeatDate;
};

// Calculate days until the next heat
export const calculateDaysUntilNextHeat = (dog: Dog): number => {
  const expectedHeatDate = calculateExpectedHeatDate(dog);
  return differenceInDays(expectedHeatDate, new Date());
};

// Calculate heat index (0-100) based on days until next heat
export const calculateHeatIndex = (dog: Dog): number => {
  const daysUntilNextHeat = calculateDaysUntilNextHeat(dog);
  const heatCycle = calculateHeatCycle(dog);
  const percentageLeft = (daysUntilNextHeat / heatCycle) * 100;
  return Math.max(0, Math.min(100, percentageLeft)); // Ensure value is between 0 and 100
};

// Calculate upcoming heats for all dogs
export const calculateUpcomingHeats = (dogs: Dog[]) => {
  return dogs.map(dog => {
    const expectedDate = calculateExpectedHeatDate(dog);
    const daysUntil = differenceInDays(expectedDate, new Date());
    const heatIndex = calculateHeatIndex(dog);

    return {
      id: dog.id,
      dogId: dog.id,
      dogName: dog.name,
      expectedDate: expectedDate,
      daysUntil: daysUntil,
      heatIndex: heatIndex
    };
  }).filter(heat => heat.daysUntil >= 0 && heat.daysUntil <= 90); // Only show heats within the next 90 days
};

// If dog.heatCycle is being used but doesn't exist on the Dog type, we need to access heatInterval instead
export function calculateHeatCycle(dog: any): number {
  // Check for heatInterval field first
  if (dog.heatInterval) {
    return dog.heatInterval;
  }
  
  // Fall back to heatCycle if it exists (for backward compatibility)
  if (dog.heatCycle) {
    return dog.heatCycle;
  }
  
  // Default heat cycle is 6 months
  return 6 * 30; // 6 months in days
}
