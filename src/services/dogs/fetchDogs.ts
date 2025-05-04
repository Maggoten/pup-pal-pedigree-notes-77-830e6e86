
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT, isTimeoutError } from '@/utils/timeoutUtils';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';

// Constants for timeouts and retries
const MOBILE_TIMEOUT = 15000; // 15 seconds for mobile devices
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

export async function fetchDogs(userId: string): Promise<Dog[]> {
  if (!userId) {
    console.error('[Dogs Debug] fetchDogs called without userId');
    return [];
  }

  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  const effectiveTimeout = isMobileDevice() ? MOBILE_TIMEOUT : TIMEOUT;
  
  console.log(`[Dogs Debug] Fetching dogs for user ${userId} on ${deviceType}`);
  console.log(`[Dogs Debug] Using timeout: ${effectiveTimeout}ms with ${MAX_RETRIES} retries`);
  
  try {
    // Use our new retry wrapper for the fetch operation
    const response = await fetchWithRetry<PostgrestResponse<DbDog>>(
      // Fetch function
      () => supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      // Retry options
      {
        maxRetries: MAX_RETRIES,
        initialDelay: RETRY_DELAY,
        useBackoff: true,
        onRetry: (attempt, error) => {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.log(`[Dogs Debug] Retry #${attempt} after error: ${errorMsg}`);
          
          // Show toast only on first retry to avoid spamming
          if (attempt === 1) {
            toast({
              title: "Retrying connection",
              description: "Slow network detected. Retrying..."
            });
          }
        }
      }
    );

    if (response.error) {
      throw new Error(response.error.message);
    }
    
    const dogCount = response.data?.length || 0;
    console.log(`[Dogs Debug] Retrieved ${dogCount} dogs from database`);
    
    if (dogCount === 0) {
      console.log(`[Dogs Debug] No dogs found for user ${userId}`);
      return [];
    }
    
    try {
      const enrichedDogs = (response.data || []).map(enrichDog);
      console.log(`[Dogs Debug] Successfully enriched ${enrichedDogs.length} dogs`);
      return enrichedDogs;
    } catch (enrichError) {
      console.error(`[Dogs Debug] Error during dog enrichment:`, enrichError);
      // Even if enrichment fails, try to return the raw data
      return (response.data || []) as unknown as Dog[];
    }
  } catch (error) {
    console.error('[Dogs Debug] Failed to fetch dogs:', error);
    
    // Create detailed error message based on error type
    let errorMessage = 'Failed to fetch dogs';
    
    if (isTimeoutError(error)) {
      errorMessage = `[${deviceType}] Request timed out after ${effectiveTimeout}ms. Please check your connection.`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Show toast with retry option
    toast({
      title: "Error loading dogs",
      description: errorMessage,
      variant: "destructive",
      action: (
        <button 
          className="bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
          onClick={() => fetchDogs(userId)}
        >
          Retry
        </button>
      )
    });
    
    throw new Error(errorMessage);
  }
}
