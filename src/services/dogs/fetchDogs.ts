
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT } from '@/utils/timeoutUtils';

// Add device detection
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const MOBILE_TIMEOUT = 15000; // 15 seconds for mobile devices

export async function fetchDogs(userId: string): Promise<Dog[]> {
  if (!userId) {
    console.error('[Dogs Debug] fetchDogs called without userId');
    return [];
  }

  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  const effectiveTimeout = isMobileDevice() ? MOBILE_TIMEOUT : TIMEOUT;
  
  console.log(`[Dogs Debug] Fetching dogs for user ${userId} on ${deviceType}`);
  console.log(`[Dogs Debug] Using timeout: ${effectiveTimeout}ms`);
  
  try {
    const startTime = performance.now();
    console.log(`[Dogs Debug] Database request started at ${new Date().toISOString()}`);
    
    const response = await withTimeout<PostgrestResponse<DbDog>>(
      supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      effectiveTimeout
    );

    const endTime = performance.now();
    console.log(`[Dogs Debug] Query execution time: ${Math.round(endTime - startTime)}ms`);

    if (response.error) {
      console.error(`[Dogs Debug] Error fetching dogs: ${response.error.message}`);
      console.error(`[Dogs Debug] Error details:`, response.error);
      throw new Error(response.error.message);
    }
    
    const dogCount = response.data?.length || 0;
    console.log(`[Dogs Debug] Retrieved ${dogCount} dogs from database`);
    
    if (dogCount === 0) {
      console.log(`[Dogs Debug] No dogs found for user ${userId}`);
      return [];
    }
    
    // Check data structure to help debug problems
    const firstDog = response.data ? response.data[0] : null;
    if (firstDog) {
      console.log(`[Dogs Debug] First dog: "${firstDog.name}" (ID: ${firstDog.id.substring(0, 8)}...)`);
      console.log(`[Dogs Debug] Heat history type: ${typeof firstDog.heatHistory}, isArray: ${Array.isArray(firstDog.heatHistory)}`);
      
      if (firstDog.heatHistory) {
        const count = Array.isArray(firstDog.heatHistory) ? firstDog.heatHistory.length : 'unknown (not an array)';
        console.log(`[Dogs Debug] Heat history entries: ${count}`);
      }
    }
    
    try {
      const enrichedDogs = (response.data || []).map(enrichDog);
      console.log(`[Dogs Debug] Successfully enriched ${enrichedDogs.length} dogs`);
      
      // Verify the enriched results
      if (enrichedDogs.length > 0) {
        const firstEnriched = enrichedDogs[0];
        console.log(`[Dogs Debug] First enriched dog: "${firstEnriched.name}" (heat entries: ${firstEnriched.heatHistory?.length || 0})`);
      }
      
      return enrichedDogs;
    } catch (enrichError) {
      console.error(`[Dogs Debug] Error during dog enrichment:`, enrichError);
      // Even if enrichment fails, try to return the raw data
      return (response.data || []) as unknown as Dog[];
    }
  } catch (error) {
    console.error('[Dogs Debug] Failed to fetch dogs:', error);
    // Add more detailed error for timeout cases
    const errorMessage = error instanceof Error ? 
      (error.message.includes('timeout') ? 
        `[${deviceType}] Request timed out after ${effectiveTimeout}ms. Please check your connection.` : 
        error.message) : 
      'Failed to fetch dogs';
    
    throw new Error(errorMessage);
  }
}
