
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from './queries/useAddLitterMutation';
import { toast } from '@/hooks/use-toast';

// Define TypeScript interfaces for the payload types
interface PuppyPayload {
  new?: {
    litter_id?: string;
    name?: string;
    [key: string]: any;
  };
  old?: {
    litter_id?: string;
    name?: string;
    [key: string]: any;
  };
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export function useLitterSubscription(loadLittersData, userId) {
  const queryClient = useQueryClient();
  
  const setupSubscription = useCallback(() => {
    if (!userId) return () => {};
    
    console.log("Setting up litter subscription for user:", userId);
    
    // Subscribe to changes in the litters table with enhanced configuration
    const littersChannel = supabase
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
        console.log('Supabase litters subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to litters table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to litters table');
          // Attempt to reconnect in case of error
          setTimeout(() => {
            console.log('Attempting to reconnect litters subscription');
            littersChannel.subscribe();
          }, 5000);
        }
      });
    
    // New subscription for puppies table
    const puppiesChannel = supabase
      .channel('puppies-realtime')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'puppies'
        },
        (payload: PuppyPayload) => {
          console.log('Puppy change detected:', payload);
          
          // Safely extract litter_id from the payload
          const litterId = payload.new?.litter_id || payload.old?.litter_id;
          if (!litterId) return;
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            console.log('Puppy added:', payload.new);
            queryClient.invalidateQueries({ queryKey: ['litters', litterId] });
            
            toast({
              title: "Puppy Added",
              description: `${payload.new?.name || 'A new puppy'} has been added to the litter.`,
              duration: 3000,
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Puppy updated:', payload.new);
            queryClient.invalidateQueries({ queryKey: ['litters', litterId] });
          } else if (payload.eventType === 'DELETE') {
            console.log('Puppy deleted:', payload.old);
            queryClient.invalidateQueries({ queryKey: ['litters', litterId] });
          }
          
          // Reload the full data set to ensure consistency
          loadLittersData();
        }
      )
      .subscribe((status) => {
        console.log('Supabase puppies subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to puppies table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to puppies table');
          setTimeout(() => {
            console.log('Attempting to reconnect puppies subscription');
            puppiesChannel.subscribe();
          }, 5000);
        }
      });
      
    return () => {
      console.log('Cleaning up Supabase channels');
      supabase.removeChannel(littersChannel);
      supabase.removeChannel(puppiesChannel);
    };
  }, [loadLittersData, userId, queryClient]);
  
  return {
    setupSubscription
  };
}
