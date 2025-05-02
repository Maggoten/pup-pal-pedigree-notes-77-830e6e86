
import { useState, useMemo } from 'react';
import { useDogs } from '@/context/DogsContext';

const useBreedingStats = () => {
  const { dogs } = useDogs();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
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
      totalLitters: yearLitters,
      totalPuppies: yearPuppies, 
      dogsAdded: dogsAddedThisYear,
      avgLitterSize: avgPuppiesPerLitter
    };
  }, [dogs, selectedYear]);

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };

  return {
    stats,
    selectedYear,
    currentYear,
    handlePreviousYear,
    handleNextYear
  };
};

export default useBreedingStats;
