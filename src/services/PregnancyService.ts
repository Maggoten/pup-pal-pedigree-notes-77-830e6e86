
import { parseISO, addDays, differenceInDays } from 'date-fns';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

export const getActivePregnancies = (): ActivePregnancy[] => {
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
  
  return pregnancies;
};

export const getFirstActivePregnancy = (): string | null => {
  const pregnancies = getActivePregnancies();
  return pregnancies.length > 0 ? pregnancies[0].id : null;
};
