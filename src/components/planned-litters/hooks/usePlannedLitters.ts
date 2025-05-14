
import { useState, useEffect } from 'react';
import { PlannedLitter } from '@/types/breeding';
import { usePlannedLitterQueries } from './usePlannedLitterQueries';
import { usePlannedLitterMutations } from './usePlannedLitterMutations';
import { plannedLittersService } from '@/services/planned-litters/plannedLittersService';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';
import { isMobileDevice } from '@/utils/fetchUtils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const usePlannedLitters = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = isMobileDevice();
  const queryClient = useQueryClient();
  
  const { 
    plannedLitters, 
    upcomingHeats, 
    recentMatings, 
    males, 
    females, 
    setPlannedLitters,
    isLoading: queriesLoading
  } = usePlannedLitterQueries();
  
  // Set up realtime subscription for planned_litters
  useEffect(() => {
    const { data: sessionData } = supabase.auth.getSession();
    if (!sessionData.session?.user?.id) return;
    
    const userId = sessionData.session.user.id;
    
    // Subscribe to changes in the planned_litters table
    const plannedLittersChannel = supabase
      .channel('planned_litters-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'planned_litters',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Planned litter change detected:', payload);
          
          // Invalidate queries and refresh data
          queryClient.invalidateQueries({ queryKey: ['planned_litters'] });
          refreshLitters();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(plannedLittersChannel);
    };
  }, [queryClient]);
  
  const refreshLitters = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing planned litters data...");
      
      // On mobile, show toast for feedback
      if (isMobile) {
        toast({
          title: "Refreshing data",
          description: "Loading your planned litters...",
          duration: 1500
        });
      }
      
      // Use fetchWithRetry for more reliable loading with mobile optimizations
      const litters = await fetchWithRetry(
        () => plannedLittersService.loadPlannedLitters(),
        {
          maxRetries: isMobile ? 3 : 2,
          initialDelay: isMobile ? 1000 : 1500,
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

  // Add automatic refresh on visibility change for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Document became visible, refreshing planned litters on mobile');
        refreshLitters();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile]);

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
