
import { useState, useEffect, useMemo } from 'react';
import { useDogs } from '@/context/DogsContext';

export interface BreedingStatsResult {
  totalPuppies: number;
  successfulLitters: number;
  avgLitterSize: number;
  healthScores: {
    totalLitters: number;
    averageLitterSize: number;
  };
  isLoading: boolean;
}

export const useBreedingStats = (selectedYear: number): BreedingStatsResult => {
  const { dogs, loading } = useDogs();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Calculate statistics for the selected year
  const stats = useMemo(() => {
    // Calculate dogs added this year
    const dogsAddedThisYear = dogs.filter(dog => {
      if (!dog.dateOfBirth) return false;
      const dogYear = new Date(dog.dateOfBirth).getFullYear();
      return dogYear === selectedYear;
    }).length;

    // Calculate litters and puppies for the selected year
    let yearLitters = 0;
    let yearPuppies = 0;
    
    // Iterate through each dog's breeding history to find litters in the selected year
    dogs.forEach(dog => {
      if (dog.breedingHistory?.litters) {
        dog.breedingHistory.litters.forEach(litter => {
          const litterDate = litter.date ? new Date(litter.date) : null;
          if (litterDate && litterDate.getFullYear() === selectedYear) {
            yearLitters += 1;
            yearPuppies += litter.puppies || 0;
          }
        });
      }
    });

    // Average puppies per litter
    const avgPuppiesPerLitter = yearLitters > 0 
      ? Math.round((yearPuppies / yearLitters) * 10) / 10 
      : 0;
    
    return {
      totalPuppies: yearPuppies,
      successfulLitters: yearLitters, 
      avgLitterSize: avgPuppiesPerLitter,
      healthScores: {
        totalLitters: yearLitters,
        averageLitterSize: avgPuppiesPerLitter
      }
    };
  }, [dogs, selectedYear]);

  // Reset loading state when dogs data or year changes
  useEffect(() => {
    setIsLoading(loading);
    
    // If data is already loaded, set a short timeout to simulate loading
    // for better UX when switching years
    if (!loading) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading, selectedYear]);

  return {
    ...stats,
    isLoading
  };
};

// Also export as default for backward compatibility
export default useBreedingStats;
