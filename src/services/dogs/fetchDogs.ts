
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';

export async function fetchDogs(userId: string): Promise<Dog[]> {
  if (!userId) {
    console.error('[FETCH_DOGS] fetchDogs called without userId');
    return [];
  }

  try {
    console.log(`[FETCH_DOGS] Fetching dogs for user ${userId}`);
    
    // Add more detailed logging about the request
    console.log(`[FETCH_DOGS] Request started at ${new Date().toISOString()}`);
    
    const response = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      TIMEOUT
    );

    if (response.error) {
      console.error('[FETCH_DOGS] Error fetching dogs:', response.error.message);
      console.error('[FETCH_DOGS] Error details:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('[FETCH_DOGS] No data returned from Supabase for user', userId);
      return [];
    }
    
    if (response.data.length === 0) {
      console.warn('[FETCH_DOGS] No dogs found for user', userId);
      return [];
    }
    
    console.log(`[FETCH_DOGS] Retrieved ${response.data.length} dogs from database`);
    
    // Log details of the first dog to help debug date parsing issues
    if (response.data.length > 0) {
      const firstDog = response.data[0];
      console.log('[FETCH_DOGS] First dog sample:', {
        id: firstDog.id,
        name: firstDog.name,
        gender: firstDog.gender,
        vaccinationDate: firstDog.vaccinationDate,
        heatHistory: firstDog.heatHistory ? 
          `${Array.isArray(firstDog.heatHistory) ? firstDog.heatHistory.length : 0} entries` : 'undefined',
        heatHistoryType: firstDog.heatHistory ? 
          `Type: ${Array.isArray(firstDog.heatHistory) ? 'Array' : typeof firstDog.heatHistory}` : 'undefined',
        lastHeatObj: firstDog.heatHistory && 
                  Array.isArray(firstDog.heatHistory) && 
                  firstDog.heatHistory.length > 0 ? 
          JSON.stringify(firstDog.heatHistory[0]) : 'none',
        lastHeat: firstDog.heatHistory && 
                  Array.isArray(firstDog.heatHistory) && 
                  firstDog.heatHistory.length > 0 && 
                  typeof firstDog.heatHistory[0] === 'object' && 
                  firstDog.heatHistory[0] !== null &&
                  'date' in firstDog.heatHistory[0] ? 
          firstDog.heatHistory[0].date : 'none'
      });
    }
    
    // Enhanced logging for all dogs to catch any inconsistencies
    response.data.forEach((dog, index) => {
      if (!dog.heatHistory || !Array.isArray(dog.heatHistory)) {
        console.log(`[FETCH_DOGS] Dog #${index} (${dog.name}) has invalid heatHistory:`, dog.heatHistory);
      }
      if (dog.vaccinationDate) {
        console.log(`[FETCH_DOGS] Dog #${index} (${dog.name}) vaccination date:`, dog.vaccinationDate);
      }
    });
    
    console.log(`[FETCH_DOGS] Processing dogs data completed at ${new Date().toISOString()}`);
    
    return (response.data || []).map(enrichDog);
  } catch (error) {
    console.error('[FETCH_DOGS] Failed to fetch dogs:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch dogs');
  }
}
