
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
async function fetchActiveLittersRaw(userId: string): Promise<RawLitterRow[]> {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
  
    if (error) throw error;
    return (data || []) as RawLitterRow[];
  } catch (error) {
    console.error("Error in fetchActiveLittersRaw:", error);
    return [];
  }
}

/**
 * Fetch archived litters directly from Supabase
 */
async function fetchArchivedLittersRaw(userId: string): Promise<RawLitterRow[]> {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'archived')
      .order('created_at', { ascending: false });
  
    if (error) throw error;
    return (data || []) as RawLitterRow[];
  } catch (error) {
    console.error("Error in fetchArchivedLittersRaw:", error);
    return [];
  }
}

/**
 * Simple retry mechanism without complex generics
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  
  throw lastError;
}

export function useLitterQueries() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Function to fetch and map active litters
  const fetchActiveLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Use our simplified retry function with concrete return type
      const rawLitters: RawLitterRow[] = await retryOperation(
        () => fetchActiveLittersRaw(userId),
        2,
        1000
      );
      
      // Map after fetching is complete
      return rawLitters.map(mapRawRowToLitter);
    } catch (error) {
      console.error("Error fetching active litters:", error);
      return [];
    }
  }, [userId]);
  
  // Function to fetch and map archived litters
  const fetchArchivedLitters = useCallback(async (): Promise<Litter[]> => {
    if (!userId) return [];
    
    try {
      // Use our simplified retry function with concrete return type  
      const rawLitters: RawLitterRow[] = await retryOperation(
        () => fetchArchivedLittersRaw(userId),
        2,
        1000
      );
      
      // Map after fetching is complete
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
