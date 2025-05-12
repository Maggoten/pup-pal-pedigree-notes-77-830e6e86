
import { supabase } from '@/integrations/supabase/client';
import { PlannedLitter } from '@/types/breeding';
import { fetchWithRetry } from '@/utils/fetchUtils';

// Function to fetch planned litters for a specific user
export const fetchPlannedLitters = async (userId: string): Promise<PlannedLitter[]> => {
  try {
    // Fetch planned litters from Supabase for the current user
    const { data, error } = await fetchWithRetry(
      () => supabase
        .from('planned_litters')
        .select('*, dam:dam_id(*), sire:sire_id(*)')
        .eq('user_id', userId)
        .order('expected_heat_date', { ascending: true }),
      {
        maxRetries: 3,
        initialDelay: 1000
      }
    );
    
    if (error) {
      console.error("Error fetching planned litters:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length} planned litters for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error("Error fetching planned litters:", error);
    return [];
  }
};
