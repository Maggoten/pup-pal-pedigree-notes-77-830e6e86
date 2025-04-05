
import { parseISO, addDays, differenceInDays } from 'date-fns';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

// Create a simple caching mechanism
let pregnancyCache: {
  data: ActivePregnancy[];
  timestamp: number;
} | null = null;

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export const getActivePregnancies = (): ActivePregnancy[] => {
  // Check if we have a valid cache
  if (pregnancyCache && (Date.now() - pregnancyCache.timestamp < CACHE_EXPIRATION)) {
    return pregnancyCache.data;
  }
  
  try {
    const plannedLittersJSON = localStorage.getItem('plannedLitters');
    if (!plannedLittersJSON) return [];
    
    const plannedLitters = JSON.parse(plannedLittersJSON);
    
    // Filter for litters that have mating dates
    const pregnancies = plannedLitters
      .filter((litter: any) => litter.matingDates && litter.matingDates.length > 0)
      .map((litter: any) => {
        // Use the most recent mating date
        const sortedMatingDates = [...litter.matingDates].sort((a: string, b: string) => 
          new Date(b).getTime() - new Date(a).getTime()
        );
        
        const matingDate = parseISO(sortedMatingDates[0]);
        const expectedDueDate = addDays(matingDate, 63); // 63 days is the average gestation period for dogs
        const daysLeft = differenceInDays(expectedDueDate, new Date());
        
        return {
          id: litter.id,
          maleName: litter.maleName,
          femaleName: litter.femaleName,
          matingDate,
          expectedDueDate,
          daysLeft: daysLeft > 0 ? daysLeft : 0
        };
      });
    
    // Update the cache
    pregnancyCache = {
      data: pregnancies,
      timestamp: Date.now()
    };
    
    return pregnancies;
  } catch (error) {
    console.error("Error getting active pregnancies:", error);
    return [];
  }
};

// Clear cache (call this when pregnancy data might have changed)
export const clearPregnancyCache = () => {
  pregnancyCache = null;
};

export const getFirstActivePregnancy = (): string | null => {
  const pregnancies = getActivePregnancies();
  return pregnancies.length > 0 ? pregnancies[0].id : null;
};
