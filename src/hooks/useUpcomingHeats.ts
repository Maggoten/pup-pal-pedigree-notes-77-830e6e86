
import { useState, useEffect } from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { useDogs } from '@/context/DogsContext';
import { Dog } from '@/types/dogs';

export const useUpcomingHeats = () => {
  const { dogs } = useDogs();
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Use the existing calculateUpcomingHeats utility function
    const heats = calculateUpcomingHeats(dogs);
    setUpcomingHeats(heats);
    setLoading(false);
  }, [dogs]);

  const refreshHeats = () => {
    const heats = calculateUpcomingHeats(dogs);
    setUpcomingHeats(heats);
  };

  return { upcomingHeats, loading, refreshHeats };
};
