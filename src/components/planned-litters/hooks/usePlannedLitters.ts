
import { useState } from 'react';
import { PlannedLitter } from '@/types/breeding';
import { usePlannedLitterQueries } from './usePlannedLitterQueries';
import { usePlannedLitterMutations } from './usePlannedLitterMutations';
import { plannedLittersService } from '@/services/PlannedLitterService';

export const usePlannedLitters = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    plannedLitters, 
    upcomingHeats, 
    recentMatings, 
    males, 
    females, 
    setPlannedLitters 
  } = usePlannedLitterQueries();
  
  const refreshLitters = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing planned litters data...");
      const litters = await plannedLittersService.loadPlannedLitters();
      
      // Directly update the state with the new litters
      setPlannedLitters(litters);
      console.log("Planned litters refreshed:", litters);
    } catch (error) {
      console.error('Error refreshing planned litters:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const mutations = usePlannedLitterMutations(refreshLitters);

  return {
    plannedLitters,
    upcomingHeats,
    recentMatings,
    males,
    females,
    isRefreshing,
    ...mutations,
  };
};
