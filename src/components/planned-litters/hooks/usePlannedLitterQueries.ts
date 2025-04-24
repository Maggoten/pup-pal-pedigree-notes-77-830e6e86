
import { useState, useEffect } from 'react';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { useRecentMatings } from './useRecentMatings';
import { UsePlannedLitterQueries } from './types';

export const usePlannedLitterQueries = () => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [upcomingHeats, setUpcomingHeats] = useState(calculateUpcomingHeats([]));
  const [isLoading, setIsLoading] = useState(true);
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  const { recentMatings, setRecentMatings } = useRecentMatings(plannedLitters);
  
  useEffect(() => {
    const loadLitters = async () => {
      try {
        setIsLoading(true);
        const litters = await plannedLittersService.loadPlannedLitters();
        setPlannedLitters(litters);
      } catch (error) {
        console.error('Error loading planned litters:', error);
      } finally {
        setIsLoading(false);
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
    females,
    isLoading,
    setPlannedLitters,
  };
};
