
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';
import { enrichDog, DbDog } from '@/utils/dogUtils';
import { PostgrestResponse } from '@supabase/supabase-js';
import { withTimeout, TIMEOUT, isTimeoutError } from '@/utils/timeoutUtils';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';
import { toast } from '@/hooks/use-toast';
import { validateCrossStorageSession } from '@/utils/storage/core/session';

// Constants for timeouts and retries - Increased values for mobile
const MOBILE_TIMEOUT = 20000; // 20 seconds for mobile devices (increased from 15s)
const MAX_RETRIES = 4; // Increased from 3
const RETRY_DELAY = 1200; // Slightly reduced for faster initial retry
const MOBILE_PAGE_SIZE = 5; // Smaller page size for mobile devices
const DESKTOP_PAGE_SIZE = 20; // Larger page size for desktop devices
const AUTH_ERROR_CODES = ['401', 'JWT', 'auth', 'unauthorized', 'token', 'expired'];

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
  
  try {
    // First, verify session is valid when on mobile before attempting fetches
    if (isMobileDevice()) {
      const isSessionValid = await validateCrossStorageSession();
      if (!isSessionValid) {
        console.warn('[Dogs Debug] Session validation failed on mobile, might need to reauthenticate');
        // Return empty array instead of showing error immediately
        // This gives the system a chance to recover the session first
        return [];
      }
    }
    
    // Get current session before making data request
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn('[Dogs Debug] No active session found before fetching dogs');
      
      if (isMobileDevice()) {
        // On mobile, try one more session refresh attempt with extended timeout
        console.log('[Dogs Debug] Attempting emergency session refresh on mobile');
        try {
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (!refreshData.session) {
            console.warn('[Dogs Debug] Mobile emergency refresh failed');
            return [];
          }
          console.log('[Dogs Debug] Mobile emergency refresh succeeded, proceeding with fetch');
        } catch (refreshErr) {
          console.error('[Dogs Debug] Mobile emergency refresh error:', refreshErr);
          return [];
        }
      } else {
        // Return empty array instead of showing error immediately
        // This allows the auth system to recover the session first
        return [];
      }
    }
    
    // Use our retry wrapper for the fetch operation with pagination and specific columns
    const response = await fetchWithRetry<PostgrestResponse<DbDog>>(
      // Fetch function with specific fields instead of select('*')
      () => supabase
        .from('dogs')
        .select('id, name, breed, gender, birthdate, color, image_url, heatHistory, heatInterval, owner_id, created_at')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .range(start, end) as unknown as Promise<PostgrestResponse<DbDog>>,
      // Retry options - more retries for mobile
      {
        maxRetries: isMobileDevice() ? MAX_RETRIES + 1 : MAX_RETRIES,
        initialDelay: RETRY_DELAY,
        useBackoff: true, // Enable exponential backoff
        onRetry: (attempt) => {
          const errorMsg = `Fetch attempt ${attempt} failed`;
          console.log(`[Dogs Debug] Retry #${attempt}/${MAX_RETRIES}: ${errorMsg}`);
          
          // Show toast only on first retry to avoid spamming
          if (attempt === 1) {
            toast({
              title: "Retrying connection",
              description: isMobileDevice() 
                ? "Mobile connection is slow. Retrying..."
                : "Slow network detected. Retrying..."
            });
          }
        }
      }
    );

    if (response.error) {
      // Check if error is auth-related
      const errorMsg = response.error.message.toLowerCase();
      const isAuthError = AUTH_ERROR_CODES.some(code => 
        errorMsg.includes(code.toLowerCase()));
      
      if (isAuthError) {
        console.warn('[Dogs Debug] Auth error from Supabase:', errorMsg);
        
        // For mobile auth errors, try an additional session refresh
        if (isMobileDevice()) {
          console.log('[Dogs Debug] Trying mobile session recovery after auth error');
          try {
            await supabase.auth.refreshSession();
          } catch (refreshErr) {
            console.warn('[Dogs Debug] Mobile refresh after auth error failed:', refreshErr);
          }
        }
        
        // For auth errors, just return empty array and let auth system handle recovery
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
      // For auth errors, just return empty array and let auth system handle it
      return [];
    }
    
    // Create detailed error message based on error type
    let errorMessage = 'Failed to fetch dogs';
    
    if (isTimeoutError(error)) {
      errorMessage = `[${deviceType}] Request timed out after ${effectiveTimeout}ms. Please check your connection.`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // More detailed mobile-specific error message
    if (isMobileDevice()) {
      errorMessage = `Mobile data fetch error: ${errorMessage}. Try refreshing the page.`;
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

// Add a new function to fetch total count for pagination with better mobile error handling
export async function fetchDogsCount(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }
  
  const retryOptions = {
    maxRetries: isMobileDevice() ? 3 : 2,
    initialDelay: 1000,
    useBackoff: true
  };
  
  try {
    // Use retry wrapper for mobile reliability
    const response = await fetchWithRetry(
      () => supabase
        .from('dogs')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', userId),
      retryOptions
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.count || 0;
  } catch (error) {
    console.error('[Dogs Debug] Failed to fetch dog count:', error);
    return 0;
  }
}
