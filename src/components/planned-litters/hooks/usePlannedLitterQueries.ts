
import { useState, useEffect } from 'react';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { useRecentMatings } from './useRecentMatings';
import { UsePlannedLitterQueries } from './types';

export const usePlannedLitterQueries = (): UsePlannedLitterQueries => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [upcomingHeats, setUpcomingHeats] = useState(calculateUpcomingHeats([]));
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  const { recentMatings } = useRecentMatings(plannedLitters);
  
  useEffect(() => {
    const loadLitters = async () => {
      try {
        const litters = await plannedLittersService.loadPlannedLitters();
        setPlannedLitters(litters);
      } catch (error) {
        console.error('Error loading planned litters:', error);
      }
    };

    loadLitters();
    setUpcomingHeats(calculateUpcomingHeats(dogs));
  }, [dogs]);

  return {
    plannedLitters,
    upcomingHeats,
    recentMatings,
    males,
    females
  };
};
