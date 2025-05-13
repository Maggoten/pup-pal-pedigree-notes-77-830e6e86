
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Litter } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';

// Define a raw litter row type to match database schema
interface RawLitterRow {
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
  created_at?: string;
}

/**
 * Maps a raw database row to the Litter domain model
 */
function mapRawRowToLitter(row: RawLitterRow): Litter {
  return {
    id: row.id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    sireId: row.sire_id || '',
    damId: row.dam_id || '',
    sireName: row.sire_name || '',
    damName: row.dam_name || '',
    puppies: [],
    archived: row.archived || false,
    user_id: row.user_id
  };
}

/**
 * Fetch litters from Supabase with explicit return type
 */
async function fetchLittersFromSupabase(userId: string, status: 'active' | 'archived'): Promise<RawLitterRow[]> {
  const { data, error } = await supabase
    .from('litters')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as RawLitterRow[];
}

// Simple type for retry options
type RetryOptions = {
  maxRetries: number;
  initialDelay: number;
};

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Explicitly type the return value
  const fetchActiveLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Use explicit two-argument generics to avoid deep type inference
      const fetchFunction = () => fetchLittersFromSupabase(userId, 'active');
      const rawLitters = await fetchWithRetry<RawLitterRow[], RawLitterRow[]>(
        fetchFunction, 
        { maxRetries: 2, initialDelay: 1000 }
      );
      
      // Map to domain model outside the fetch call
      return rawLitters.map(mapRawRowToLitter);
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  // Explicitly type the return value
  const fetchArchivedLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Use explicit two-argument generics to avoid deep type inference
      const fetchFunction = () => fetchLittersFromSupabase(userId, 'archived');
      const rawLitters = await fetchWithRetry<RawLitterRow[], RawLitterRow[]>(
        fetchFunction, 
        { maxRetries: 2, initialDelay: 1000 }
      );
      
      // Map to domain model outside the fetch call
      return rawLitters.map(mapRawRowToLitter);
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
