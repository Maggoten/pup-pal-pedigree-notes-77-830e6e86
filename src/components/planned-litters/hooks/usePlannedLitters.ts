
import { useState } from 'react';
import { usePlannedLitterQueries } from './usePlannedLitterQueries';
import { usePlannedLitterMutations } from './usePlannedLitterMutations';
import { plannedLittersService } from '@/services/PlannedLitterService';

export const usePlannedLitters = () => {
  const queries = usePlannedLitterQueries();
  
  const refreshLitters = async () => {
    const litters = await plannedLittersService.loadPlannedLitters();
    // Since the queries hook manages state, we'll let it handle the update
    // through its own useEffect dependency on dogs
  };

  const mutations = usePlannedLitterMutations(refreshLitters);

  return {
    ...queries,
    ...mutations,
  };
};
