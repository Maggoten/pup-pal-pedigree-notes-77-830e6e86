
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, isStorageError } from '../config';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { getPlatformInfo } from '../mobileUpload';

// Safe error property access helper
const safeGetErrorProperty = <T>(error: unknown, property: string, defaultValue: T): T => {
  if (error && typeof error === 'object' && property in error) {
    return (error as any)[property];
  }
  return defaultValue;
};

/**
 * Check if bucket exists and is accessible with retries
 * @returns boolean indicating if bucket exists and is accessible
 */
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Storage bucket check failed: No active session', sessionError);
      return false;
    }

    console.log(`Checking if bucket '${BUCKET_NAME}' exists...`);
    
    const platform = getPlatformInfo();
    try {
      // Using our retry utility for more reliable bucket checking
      const result = await fetchWithRetry(
        () => supabase.storage.from(BUCKET_NAME).list('', { limit: 1 }),
        { 
          maxRetries: platform.safari ? 3 : 2, 
          initialDelay: platform.safari ? 2000 : 1000,
          onRetry: (attempt) => {
            console.log(`Bucket check retry attempt ${attempt} - Safari: ${platform.safari}`);
          }
        }
      );
      
      if (result.error) {
        console.error(`Bucket '${BUCKET_NAME}' check failed:`, result.error);
        // Log more details about the error for troubleshooting
        console.error('Error details:', {
          message: safeGetErrorProperty(result.error, 'message', 'Unknown error'),
          status: safeGetErrorProperty(result.error, 'status', 'unknown'),
          details: safeGetErrorProperty(result.error, 'details', 'none')
        });
        return false;
      }
      
      console.log(`Bucket '${BUCKET_NAME}' exists and is accessible, can list files:`, result.data);
      return true;
    } catch (listError) {
      console.error(`Error or timeout when listing bucket '${BUCKET_NAME}' contents:`, listError);
      return false;
    }
  } catch (err) {
    console.error(`Error in bucket '${BUCKET_NAME}' verification:`, err);
    return false;
  }
};
