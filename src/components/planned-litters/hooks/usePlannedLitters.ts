
import { useState } from 'react';
import { PlannedLitter } from '@/types/breeding';
import { usePlannedLitterQueries } from './usePlannedLitterQueries';
import { usePlannedLitterMutations } from './usePlannedLitterMutations';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';

export const usePlannedLitters = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    plannedLitters, 
    upcomingHeats, 
    recentMatings, 
    males, 
    females, 
    setPlannedLitters,
    isLoading: queriesLoading
  } = usePlannedLitterQueries();
  
  const refreshLitters = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing planned litters data...");
      
      // Use fetchWithRetry for more reliable loading
      const litters = await fetchWithRetry(
        () => plannedLittersService.loadPlannedLitters(),
        {
          maxRetries: 2,
          initialDelay: 1500,
          onRetry: (attempt) => {
            toast({
              title: "Retrying connection",
              description: `Attempt ${attempt}/2: Loading planned litters...`
            });
          }
        }
      );
      
      // Directly update the state with the new litters
      setPlannedLitters(litters);
      console.log("Planned litters refreshed:", litters);
      
      toast({
        title: "Data refreshed",
        description: `${litters.length} planned litters loaded successfully.`
      });
    } catch (error) {
      console.error('Error refreshing planned litters:', error);
      toast({
        title: "Refresh failed",
        description: "Could not load planned litters. Please try again.",
        variant: "destructive",
        action: {
          label: "Retry",
          onClick: refreshLitters,
          className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
        }
      });
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
    isLoading: queriesLoading,
    ...mutations,
    refreshLitters
  };
};
