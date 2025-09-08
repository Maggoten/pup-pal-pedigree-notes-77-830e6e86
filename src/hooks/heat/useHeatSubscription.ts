import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Define TypeScript interfaces for the payload types
interface HeatCyclePayload {
  new?: {
    id?: string;
    dog_id?: string;
    start_date?: string;
    end_date?: string;
    [key: string]: any;
  };
  old?: {
    id?: string;
    dog_id?: string;
    start_date?: string;
    end_date?: string;
    [key: string]: any;
  };
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

interface HeatLogPayload {
  new?: {
    id?: string;
    heat_cycle_id?: string;
    [key: string]: any;
  };
  old?: {
    id?: string;
    heat_cycle_id?: string;
    [key: string]: any;
  };
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export function useHeatSubscription(refreshData: () => void, userId?: string) {
  const queryClient = useQueryClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const setupSubscription = useCallback(() => {
    if (!userId) return () => {};
    
    console.log("Setting up heat cycles subscription for user:", userId);
    
    // Subscribe to changes in the heat_cycles table
    const heatCyclesChannel = supabase
      .channel('heat-cycles-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'heat_cycles',
          filter: `user_id=eq.${userId}`
        },
        (payload: HeatCyclePayload) => {
          console.log('Heat cycle change detected:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Heat Cycle Added",
              description: "A new heat cycle has been added.",
              duration: 3000,
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Heat cycle updated:', payload.new);
            toast({
              title: "Heat Cycle Updated", 
              description: "Heat cycle has been updated.",
              duration: 3000,
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('Heat cycle deleted:', payload.old);
            toast({
              title: "Heat Cycle Deleted",
              description: "Heat cycle has been removed.",
              duration: 3000,
            });
          }
          
          // Debounce refresh calls to prevent rapid updates
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
          
          refreshTimeoutRef.current = setTimeout(() => {
            // Invalidate queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['heat-cycles'] });
            queryClient.invalidateQueries({ queryKey: ['unified-heat-data'] });
            
            // Also reload the full data set
            refreshData();
          }, 500);
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'heat_logs',
          filter: `user_id=eq.${userId}`
        },
        (payload: HeatLogPayload) => {
          console.log('Heat log change detected:', payload);
          
          // Debounce refresh calls for heat logs too
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
          
          refreshTimeoutRef.current = setTimeout(() => {
            // Invalidate queries for heat logs
            queryClient.invalidateQueries({ queryKey: ['heat-logs'] });
            queryClient.invalidateQueries({ queryKey: ['unified-heat-data'] });
            
            // Refresh data
            refreshData();
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log('Supabase heat subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to heat tables');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to heat tables');
          // Attempt to reconnect in case of error
          setTimeout(() => {
            console.log('Attempting to reconnect heat subscription');
            heatCyclesChannel.subscribe();
          }, 5000);
        }
      });
      
    return () => {
      console.log('Cleaning up Supabase heat channel');
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(heatCyclesChannel);
    };
  }, [refreshData, userId, queryClient]);
  
  return {
    setupSubscription
  };
}

export default useHeatSubscription;