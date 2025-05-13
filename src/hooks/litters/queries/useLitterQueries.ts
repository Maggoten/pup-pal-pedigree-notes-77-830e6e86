
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Litter } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';

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

// Type alias for array of raw litter rows
type RawLitters = RawLitterRow[];

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
 * Fetch active litters directly from Supabase
 */
async function fetchActiveLittersFromDb(userId: string): Promise<RawLitters> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('litters')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as RawLitters;
}

/**
 * Fetch archived litters directly from Supabase
 */
async function fetchArchivedLittersFromDb(userId: string): Promise<RawLitters> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('litters')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'archived')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as RawLitters;
}

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Function to fetch and map active litters
  const fetchActiveLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Direct fetch without retry wrapper
      const rawLitters: RawLitters = await fetchActiveLittersFromDb(userId);
      
      // Map after fetching is complete with explicit typing
      const mappedLitters: Litter[] = rawLitters.map(mapRawRowToLitter);
      return mappedLitters;
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  // Function to fetch and map archived litters
  const fetchArchivedLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Direct fetch without retry wrapper
      const rawLitters: RawLitters = await fetchArchivedLittersFromDb(userId);
      
      // Map after fetching is complete with explicit typing
      const mappedLitters: Litter[] = rawLitters.map(mapRawRowToLitter);
      return mappedLitters;
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
