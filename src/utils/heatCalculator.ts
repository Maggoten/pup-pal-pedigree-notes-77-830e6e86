
import { addDays } from 'date-fns';
import { UpcomingHeat } from '@/types/reminders';
import { Dog } from '@/types/dogs';

export const calculateUpcomingHeats = (dogs: Dog[]): UpcomingHeat[] => {
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  
  const upcomingHeats: UpcomingHeat[] = [];
  
  for (const dog of femaleDogs) {
    if (!dog.heatHistory || !Array.isArray(dog.heatHistory) || dog.heatHistory.length === 0) {
      continue;
    }
    
    // Get the most recent heat date
    const sortedHeats = [...dog.heatHistory].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    const latestHeat = sortedHeats[0];
    const latestHeatDate = new Date(latestHeat.date);
    
    // Calculate next heat date using the dog's heat interval (in days) or a default of 180 days
    const heatInterval = dog.heatInterval || 180;
    const nextHeatDate = addDays(latestHeatDate, heatInterval);
    
    // Only include heats that are in the future
    if (nextHeatDate > new Date()) {
      upcomingHeats.push({
        dogId: dog.id,
        dogName: dog.name,
        date: nextHeatDate,
        heatIndex: dog.heatHistory.findIndex(heat => heat.date === latestHeat.date)
      });
    }
  }
  
  // Sort by date (earliest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};
