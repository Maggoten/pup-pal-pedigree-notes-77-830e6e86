import { useState, useEffect } from 'react';
import { Dog } from '@/types/dogs';
import { PlannedLitter } from '@/types/breeding';
import { HeatPrediction, FertileDog, YEARS_TO_DISPLAY, MAX_BREEDING_AGE, WARNING_AGE } from '@/types/heatPlanning';
import { HeatService } from '@/services/HeatService';
import { calculateNextHeatDate } from '@/utils/heatCalculator';
import { addYears, addDays, differenceInDays, differenceInYears } from 'date-fns';

/**
 * Helper: Calculate age in years with decimal precision
 */
const calculateAge = (birthdate: string, referenceDate: Date = new Date()): number => {
  const birth = new Date(birthdate);
  const years = differenceInYears(referenceDate, birth);
  const daysSinceBirthday = differenceInDays(referenceDate, addYears(birth, years));
  return years + (daysSinceBirthday / 365);
};

/**
 * Helper: Find matching planned litter within ±7 days of heat date
 */
const findMatchingPlannedLitter = (
  plannedLitters: PlannedLitter[],
  dogId: string,
  heatDate: Date
): PlannedLitter | undefined => {
  return plannedLitters.find(litter => {
    if (litter.femaleId !== dogId) return false;
    
    const expectedDate = new Date(litter.expectedHeatDate);
    const daysDiff = Math.abs(differenceInDays(expectedDate, heatDate));
    
    return daysDiff <= 7;
  });
};

/**
 * Hook to calculate multi-year heat predictions for all fertile females
 * Returns predictions organized by dog ID and a list of fertile dogs
 */
export const useMultiYearHeatPredictions = (dogs: Dog[], plannedLitters: PlannedLitter[]) => {
  const [predictions, setPredictions] = useState<Map<string, HeatPrediction[]>>(new Map());
  const [fertileDogs, setFertileDogs] = useState<FertileDog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function calculatePredictions() {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Filter fertile females (not sterilized, under MAX_BREEDING_AGE)
        const fertileFemales = dogs.filter(dog => {
          if (dog.gender !== 'female') return false;
          if (dog.sterilization_date || dog.sterilizationDate) return false;
          
          const birthdate = dog.birthdate || dog.dateOfBirth;
          if (!birthdate) return false;
          
          const age = calculateAge(birthdate);
          return age < MAX_BREEDING_AGE;
        });

        if (!isMounted) return;

        // 2. Calculate predictions for each fertile female
        const predictionsMap = new Map<string, HeatPrediction[]>();
        const fertileDogsData: FertileDog[] = [];

        for (const dog of fertileFemales) {
          const birthdate = dog.birthdate || dog.dateOfBirth;
          const age = calculateAge(birthdate);
          
          // Add to fertile dogs list
          fertileDogsData.push({
            id: dog.id,
            name: dog.name,
            imageUrl: dog.image_url || dog.image,
            birthdate,
            age,
            needsWarning: age >= WARNING_AGE
          });

          try {
            // Fetch unified heat data
            const unifiedData = await HeatService.getUnifiedHeatData(dog.id);
            
            if (!isMounted) return;

            // Calculate first upcoming heat
            const nextHeatResult = calculateNextHeatDate(
              unifiedData.heatCycles || [],
              unifiedData.heatHistory || [],
              dog.id
            );

            if (!nextHeatResult.nextHeatDate) {
              // No heat data available - skip this dog
              continue;
            }

            const dogPredictions: HeatPrediction[] = [];
            let currentDate = nextHeatResult.nextHeatDate;
            const endDate = addYears(new Date(), YEARS_TO_DISPLAY);

            // Loop and predict heats for YEARS_TO_DISPLAY years forward
            let predictionCount = 0;
            const maxPredictions = 20; // Safety limit

            while (currentDate && currentDate <= endDate && predictionCount < maxPredictions) {
              // Check if there's a planned litter for this heat date
              const matchingLitter = findMatchingPlannedLitter(
                plannedLitters,
                dog.id,
                currentDate
              );

              // Determine status
              let status: HeatPrediction['status'] = 'predicted';
              if (matchingLitter) {
                status = 'planned';
              } else if (currentDate < new Date()) {
                status = 'overdue';
              }

              dogPredictions.push({
                id: `${dog.id}-${currentDate.getTime()}`,
                dogId: dog.id,
                dogName: dog.name,
                dogImageUrl: dog.image_url || dog.image,
                dogBirthdate: birthdate,
                date: currentDate,
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1,
                status,
                interval: nextHeatResult.intervalDays,
                ageAtHeat: calculateAge(birthdate, currentDate),
                hasPlannedLitter: !!matchingLitter,
                plannedLitterId: matchingLitter?.id,
                confidence: nextHeatResult.intervalSource === 'calculated' ? 'high' : 'medium',
                notes: matchingLitter?.notes
              });

              // Calculate next heat by adding interval
              currentDate = addDays(currentDate, nextHeatResult.intervalDays);
              predictionCount++;
            }

            predictionsMap.set(dog.id, dogPredictions);
          } catch (err) {
            console.error(`Error calculating predictions for dog ${dog.id}:`, err);
            // Continue with other dogs even if one fails
          }
        }

        if (!isMounted) return;

        setPredictions(predictionsMap);
        setFertileDogs(fertileDogsData);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error in calculatePredictions:', err);
        setError(err as Error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    calculatePredictions();

    return () => {
      isMounted = false;
    };
  }, [dogs, plannedLitters]);

  return {
    predictions,
    fertileDogs,
    isLoading,
    error
  };
};
