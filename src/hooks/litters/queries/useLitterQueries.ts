
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Litter } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';

// Define types for Supabase query result to avoid excessive type inference
type LitterDbRow = {
  id: string;
  name: string;
  date_of_birth: string;
  sire_id: string | null;
  dam_id: string | null;
  sire_name: string | null;
  dam_name: string | null;
  archived: boolean | null;
  user_id: string;
};

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const fetchActiveLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Create a simple function that returns a Promise<Litter[]>
      const fetchFunction = async (): Promise<Litter[]> => {
        const { data, error } = await supabase
          .from('litters')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Cast the data to ensure TypeScript knows what we're working with
        const litterData = data as LitterDbRow[] | null;
        
        // Transform the data to match the Litter interface
        const litters = (litterData || []).map(item => ({
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
        
        return litters;
      };
      
      // Use typed version of fetchWithRetry
      const result = await fetchWithRetry<Litter[]>(
        fetchFunction,
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      return result;
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  const fetchArchivedLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Create a simple function that returns a Promise<Litter[]>
      const fetchFunction = async (): Promise<Litter[]> => {
        const { data, error } = await supabase
          .from('litters')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'archived')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Cast the data to ensure TypeScript knows what we're working with
        const litterData = data as LitterDbRow[] | null;
        
        // Transform the data to match the Litter interface
        const litters = (litterData || []).map(item => ({
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
        
        return litters;
      };
      
      // Use typed version of fetchWithRetry
      const result = await fetchWithRetry<Litter[]>(
        fetchFunction,
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
      
      return result;
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
