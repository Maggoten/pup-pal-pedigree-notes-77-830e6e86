
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useLitterSubscription(loadLittersData?: () => Promise<void>, userId?: string) {
  const setupSubscription = useCallback(() => {
    if (!userId || !loadLittersData) return () => {};
    
    console.log("Setting up litter subscription for user:", userId);
    
    // Subscribe to changes in the litters table
    const channel = supabase
      .channel('litters-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'litters' },
        (payload) => {
          console.log('Litter change detected:', payload);
          // Reload litters when changes are detected
          loadLittersData();
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status);
      });
      
    return () => {
      console.log('Cleaning up Supabase channel');
      supabase.removeChannel(channel);
    };
  }, [loadLittersData, userId]);
  
  return {
    setupSubscription
  };
}
