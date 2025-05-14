
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from './queries/useAddLitterMutation';
import { toast } from '@/hooks/use-toast';

export function useLitterSubscription(loadLittersData, userId) {
  const queryClient = useQueryClient();
  
  const setupSubscription = useCallback(() => {
    if (!userId) return () => {};
    
    console.log("Setting up litter subscription for user:", userId);
    
    // Subscribe to changes in the litters table with enhanced configuration
    const channel = supabase
      .channel('litters-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'litters',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Litter change detected:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Litter Added",
              description: `A new litter "${payload.new.name}" has been added.`,
              duration: 3000,
            });
            
            // Invalidate queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: littersQueryKey });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Litter updated:', payload.new);
            queryClient.invalidateQueries({ queryKey: littersQueryKey });
          } else if (payload.eventType === 'DELETE') {
            console.log('Litter deleted:', payload.old);
            queryClient.invalidateQueries({ queryKey: littersQueryKey });
          }
          
          // Also reload the full data set
          loadLittersData();
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to litters table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to litters table');
          // Attempt to reconnect in case of error
          setTimeout(() => {
            console.log('Attempting to reconnect litters subscription');
            channel.subscribe();
          }, 5000);
        }
      });
      
    return () => {
      console.log('Cleaning up Supabase litters channel');
      supabase.removeChannel(channel);
    };
  }, [loadLittersData, userId, queryClient]);
  
  return {
    setupSubscription
  };
}
