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
    
    // Include all statuses except 'cancelled'
    if (litter.status === 'cancelled') return false;
    
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

            const dogPredictions: HeatPrediction[] = [];

            // First, add confirmed heats from current year
            const currentYear = new Date().getFullYear();
            const confirmedHeatsThisYear = (unifiedData.heatCycles || [])
              .filter(cycle => {
                const startDate = new Date(cycle.start_date);
                return startDate.getFullYear() === currentYear;
              })
              .map(cycle => {
                const startDate = new Date(cycle.start_date);
                const endDate = cycle.end_date ? new Date(cycle.end_date) : null;
                const daysSinceStart = differenceInDays(new Date(), startDate);
                
                // Determine status: active if no end_date AND < 21 days since start
                const status: HeatPrediction['status'] = 
                  (!endDate && daysSinceStart <= 21) ? 'active' : 'confirmed';
                
                return {
                  id: `${dog.id}-confirmed-${cycle.id}`,
                  dogId: dog.id,
                  dogName: dog.name,
                  dogImageUrl: dog.image_url || dog.image,
                  dogBirthdate: birthdate,
                  date: startDate,
                  year: startDate.getFullYear(),
                  month: startDate.getMonth() + 1,
                  status,
                  interval: 0, // Not relevant for confirmed heats
                  ageAtHeat: calculateAge(birthdate, startDate),
                  hasPlannedLitter: false,
                  confidence: 'high' as const,
                  notes: cycle.notes || undefined
                } as HeatPrediction;
              });

            // Add confirmed heats to predictions
            dogPredictions.push(...confirmedHeatsThisYear);

            if (!nextHeatResult.nextHeatDate) {
              // No future prediction available, but we may have confirmed heats
              // Sort predictions and add to map
              dogPredictions.sort((a, b) => {
                const statusOrder = { active: 0, confirmed: 1, planned: 2, mated: 3, predicted: 4 };
                if (a.status !== b.status) {
                  return statusOrder[a.status] - statusOrder[b.status];
                }
                return a.date.getTime() - b.date.getTime();
              });
              
              if (dogPredictions.length > 0) {
                predictionsMap.set(dog.id, dogPredictions);
              }
              continue;
            }
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
                if (matchingLitter.status === 'completed') {
                  status = 'mated'; // Green - completed mating
                } else if (matchingLitter.matingDates && matchingLitter.matingDates.length > 0) {
                  status = 'mated'; // Green - has mating dates
                } else if (matchingLitter.status === 'active' || matchingLitter.status === 'planned') {
                  status = 'planned'; // Pink - planned but not mated yet
                }
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

            // Sort all predictions: active, confirmed, planned, mated, predicted
            dogPredictions.sort((a, b) => {
              const statusOrder = { active: 0, confirmed: 1, planned: 2, mated: 3, predicted: 4 };
              if (a.status !== b.status) {
                return statusOrder[a.status] - statusOrder[b.status];
              }
              return a.date.getTime() - b.date.getTime();
            });

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
