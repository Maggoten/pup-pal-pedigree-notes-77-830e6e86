
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Litter } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const fetchActiveLitters = useCallback(async () => {
    if (!userId) return [];
    
    try {
      const result = await fetchWithRetry(
        async () => {
          const { data, error } = await supabase
            .from('litters')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          
          if (error) {
            throw error;
          }
          return data || [];
        },
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      return result as Litter[];
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  const fetchArchivedLitters = useCallback(async () => {
    if (!userId) return [];
    
    try {
      const result = await fetchWithRetry(
        async () => {
          const { data, error } = await supabase
            .from('litters')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'archived')
            .order('created_at', { ascending: false });
          
          if (error) {
            throw error;
          }
          return data || [];
        },
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      return result as Litter[];
    } catch (error) {
      console.error("Error fetching archived litters:", error);
      return [];
    }
  }, [userId]);
  
  return {
    fetchActiveLitters,
    fetchArchivedLitters
  };
}
