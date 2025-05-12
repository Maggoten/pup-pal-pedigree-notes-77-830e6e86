
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Litter } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const fetchActiveLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Explicitly type the result from fetchWithRetry to avoid deep type instantiation
      type SupabaseResult = {
        data: any[] | null;
        error: any;
      };
      
      const result = await fetchWithRetry<SupabaseResult>(
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
          
          // Transform the data to match the Litter interface
          const litters = (data || []).map(item => ({
            id: item.id,
            name: item.name,
            dateOfBirth: item.date_of_birth,
            sireId: item.sire_id || '',
            damId: item.dam_id || '',
            sireName: item.sire_name || '',
            damName: item.dam_name || '',
            puppies: [],
            archived: item.archived || false,
            user_id: item.user_id
          } as Litter));
          
          return { data: litters, error: null };
        },
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      return result.data || [];
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  const fetchArchivedLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Explicitly type the result from fetchWithRetry to avoid deep type instantiation
      type SupabaseResult = {
        data: any[] | null;
        error: any;
      };
      
      const result = await fetchWithRetry<SupabaseResult>(
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
          
          // Transform the data to match the Litter interface
          const litters = (data || []).map(item => ({
            id: item.id,
            name: item.name,
            dateOfBirth: item.date_of_birth,
            sireId: item.sire_id || '',
            damId: item.dam_id || '',
            sireName: item.sire_name || '',
            damName: item.dam_name || '',
            puppies: [],
            archived: item.archived || false,
            user_id: item.user_id
          } as Litter));
          
          return { data: litters, error: null };
        },
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      return result.data || [];
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
