
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT, isTimeoutError } from '@/utils/timeoutUtils';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';
import { verifySession } from '@/utils/auth/sessionManager';

// Constants for timeouts and retries
const MOBILE_TIMEOUT = 15000; // 15 seconds for mobile devices
const MAX_RETRIES = 3; // Increased from 2
const RETRY_DELAY = 1500; // Increased from 2000 for faster initial retry
const MOBILE_PAGE_SIZE = 5; // Smaller page size for mobile devices
const DESKTOP_PAGE_SIZE = 20; // Larger page size for desktop devices
const AUTH_ERROR_CODES = ['401', 'JWT', 'auth', 'unauthorized', 'token'];

// Function to fetch total count without data
export async function fetchDogsCount(userId: string): Promise<number> {
  if (!userId) {
    console.error('[Dogs Debug] fetchDogsCount called without userId');
    return 0;
  }

  try {
    // Verify session first
    await verifySession({ skipThrow: true });
    
    // Use a separate call with count but no data
    const { count, error } = await supabase
      .from('dogs')
      .select('id', { count: 'exact', head: true }) // head: true = no data, just count
      .eq('owner_id', userId);
    
    if (error) {
      console.error('[Dogs Debug] Error fetching dog count:', error);
      throw error;
    }
    
    console.log(`[Dogs Debug] Found ${count} dogs for user ${userId}`);
    return count || 0;
  } catch (error) {
    console.error('[Dogs Debug] Failed to fetch dog count:', error);
    return 0;
  }
}

// Primary function to fetch dogs with pagination
export async function fetchDogs(userId: string, page = 1): Promise<Dog[]> {
  if (!userId) {
    console.error('[Dogs Debug] fetchDogs called without userId');
    return [];
  }

  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  const effectiveTimeout = isMobileDevice() ? MOBILE_TIMEOUT : TIMEOUT;
  const pageSize = isMobileDevice() ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  
  console.log(`[Dogs Debug] Fetching dogs for user ${userId} on ${deviceType} (page ${page}, range ${start}-${end})`);
  console.log(`[Dogs Debug] Using timeout: ${effectiveTimeout}ms with ${MAX_RETRIES} retries`);
  
  // Verify session first before making data requests
  try {
    const isSessionValid = await verifySession({ skipThrow: true });
    if (!isSessionValid) {
      console.warn('[Dogs Debug] No valid session before fetching dogs, returning empty array');
      // Return empty array as we'll let the auth system recover the session
      return [];
    }
    
    // Use our retry wrapper for the fetch operation with pagination
    const response = await fetchWithRetry<PostgrestResponse<DbDog>>(
      // Fetch function with specific fields instead of select('*')
      () => supabase
        .from('dogs')
        .select('id, name, breed, gender, birthdate, color, image_url, heatHistory, heatInterval, owner_id, created_at')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .range(start, end), // Pagination without head:true to get actual data
      // Retry options
      {
        maxRetries: MAX_RETRIES,
        initialDelay: RETRY_DELAY,
        useBackoff: true,
        onRetry: (attempt, error) => {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.log(`[Dogs Debug] Retry #${attempt} after error: ${errorMsg}`);
          
          // Check if error is auth-related
          const isAuthError = AUTH_ERROR_CODES.some(code => 
            errorMsg.toLowerCase().includes(code.toLowerCase()));
          
          if (isAuthError) {
            console.log('[Dogs Debug] Auth-related error detected, allowing auth system to recover');
            return;
          }
          
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
      // Check if error is auth-related
      const errorMsg = response.error.message;
      const isAuthError = AUTH_ERROR_CODES.some(code => 
        errorMsg.toLowerCase().includes(code.toLowerCase()));
      
      if (isAuthError) {
        console.warn('[Dogs Debug] Auth error from Supabase:', errorMsg);
        return [];
      }
      
      throw new Error(response.error.message);
    }
    
    const dogCount = response.data?.length || 0;
    console.log(`[Dogs Debug] Retrieved ${dogCount} dogs from database (page ${page})`);
    
    if (dogCount === 0) {
      console.log(`[Dogs Debug] No dogs found for user ${userId} on page ${page}`);
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
    
    // Check if error is auth-related
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isAuthError = AUTH_ERROR_CODES.some(code => 
      errorMsg.toLowerCase().includes(code.toLowerCase()));
    
    if (isAuthError) {
      console.warn('[Dogs Debug] Auth-related error detected, returning empty array');
      return [];
    }
    
    // Create detailed error message based on error type
    let errorMessage = 'Failed to fetch dogs';
    
    if (isTimeoutError(error)) {
      errorMessage = `[${deviceType}] Request timed out after ${effectiveTimeout}ms. Please check your connection.`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Show toast with retry option if not auth-related
    if (!isAuthError) {
      toast({
        title: "Error loading dogs",
        description: errorMessage,
        variant: "destructive",
        action: {
          label: "Retry",
          onClick: () => fetchDogs(userId),
          className: "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"
        }
      });
    }
    
    throw new Error(errorMessage);
  }
}
