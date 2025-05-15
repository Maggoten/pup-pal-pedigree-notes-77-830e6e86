
import { useState, useEffect, useRef } from 'react';
import { PlannedLitter } from '@/types/breeding';
import { usePlannedLitterQueries } from './usePlannedLitterQueries';
import { usePlannedLitterMutations } from './usePlannedLitterMutations';
import { plannedLittersService } from '@/services/planned-litters/plannedLittersService';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';
import { isMobileDevice } from '@/utils/fetchUtils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useConnectionStore } from '@/utils/connectionStatus';

export const usePlannedLitters = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = isMobileDevice();
  const queryClient = useQueryClient();
  const { isOnline } = useConnectionStore();
  // Track if we've subscribed to avoid duplicate subscriptions
  const hasSubscribed = useRef(false);
  
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
    // Fixed: prevent multiple subscriptions
    if (hasSubscribed.current) {
      console.log('Already subscribed to planned_litters channel, skipping');
      return;
    }
    
    // Fixed: using async IIFE to handle the Promise properly
    (async () => {
      try {
        const sessionResult = await supabase.auth.getSession();
        const userId = sessionResult.data.session?.user?.id;
        if (!userId) return;
        
        console.log('Setting up planned_litters subscription for user:', userId);
        
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
          .subscribe((status) => {
            console.log('Planned litters subscription status:', status);
            hasSubscribed.current = true;
          });
          
        return () => {
          console.log('Removing planned_litters channel subscription');
          supabase.removeChannel(plannedLittersChannel);
          hasSubscribed.current = false;
        };
      } catch (error) {
        console.error("Error setting up planned litters subscription:", error);
      }
    })();
  }, [queryClient]); // Keep the dependency array minimal
  
  const refreshLitters = async () => {
    // Skip refresh if offline
    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "Connect to network to update data",
        duration: 3000,
      });
      return;
    }
    
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
      if (document.visibilityState === 'visible' && isOnline) {
        console.log('Document became visible, refreshing planned litters on mobile');
        refreshLitters();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile, isOnline]);

  return {
    plannedLitters,
    upcomingHeats,
    recentMatings,
    males,
    females,
    isRefreshing,
    isLoading: queriesLoading,
    isOffline: !isOnline,
    ...mutations,
    refreshLitters
  };
};
