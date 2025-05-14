
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Define TypeScript interfaces for the payload types
interface DogPayload {
  new?: {
    id?: string;
    name?: string;
    [key: string]: any;
  };
  old?: {
    id?: string;
    name?: string;
    [key: string]: any;
  };
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export function useDogSubscription(refreshDogs: () => void, userId?: string) {
  const queryClient = useQueryClient();
  
  const setupSubscription = useCallback(() => {
    if (!userId) return () => {};
    
    console.log("Setting up dog subscription for user:", userId);
    
    // Subscribe to changes in the dogs table with enhanced configuration
    const dogsChannel = supabase
      .channel('dogs-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'dogs',
          filter: `owner_id=eq.${userId}`
        },
        (payload: DogPayload) => {
          console.log('Dog change detected:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Dog Added",
              description: `${payload.new?.name || 'A new dog'} has been added.`,
              duration: 3000,
            });
            
            // Invalidate queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['dogs'] });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Dog updated:', payload.new);
            queryClient.invalidateQueries({ queryKey: ['dogs'] });
          } else if (payload.eventType === 'DELETE') {
            console.log('Dog deleted:', payload.old);
            queryClient.invalidateQueries({ queryKey: ['dogs'] });
          }
          
          // Also reload the full data set
          refreshDogs();
        }
      )
      .subscribe((status) => {
        console.log('Supabase dogs subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to dogs table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to dogs table');
          // Attempt to reconnect in case of error
          setTimeout(() => {
            console.log('Attempting to reconnect dogs subscription');
            dogsChannel.subscribe();
          }, 5000);
        }
      });
      
    return () => {
      console.log('Cleaning up Supabase dog channel');
      supabase.removeChannel(dogsChannel);
    };
  }, [refreshDogs, userId, queryClient]);
  
  return {
    setupSubscription
  };
}

export default useDogSubscription;
