
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
  status?: string;
};

// Define the return type of the database query
type SupabaseLitterResponse = {
  data: LitterDbRow[] | null;
  error: Error | null;
};

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const fetchActiveLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Define a function with explicit return type
      const fetchFunction = async (): Promise<Litter[]> => {
        // Explicitly type the response
        const response: SupabaseLitterResponse = await supabase
          .from('litters')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        const { data, error } = response;
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match the Litter interface
        const litters: Litter[] = (data || []).map(item => ({
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
        }));
        
        return litters;
      };
      
      // Use fetchWithRetry with explicit return type
      return await fetchWithRetry<Litter[]>(
        fetchFunction,
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  const fetchArchivedLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Define a function with explicit return type
      const fetchFunction = async (): Promise<Litter[]> => {
        // Explicitly type the response
        const response: SupabaseLitterResponse = await supabase
          .from('litters')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'archived')
          .order('created_at', { ascending: false });
          
        const { data, error } = response;
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match the Litter interface
        const litters: Litter[] = (data || []).map(item => ({
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
        }));
        
        return litters;
      };
      
      // Use fetchWithRetry with explicit return type
      return await fetchWithRetry<Litter[]>(
        fetchFunction,
        { 
          maxRetries: 2,
          initialDelay: 1000
        }
      );
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
