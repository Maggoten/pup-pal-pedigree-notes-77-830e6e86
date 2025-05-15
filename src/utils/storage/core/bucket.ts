
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from '../config';
import { fetchWithRetry } from '@/utils/fetchUtils';

/**
 * Check if the storage bucket exists and is accessible
 * @returns Promise resolving to true if bucket exists and is accessible
 */
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${BUCKET_NAME}' exists and is accessible...`);
    
    try {
      // Using our retry utility for more reliable bucket checking
      const result = await fetchWithRetry(
        () => supabase.storage.from(BUCKET_NAME).list('', { limit: 1 }),
        { 
          maxRetries: 2, 
          initialDelay: 1000,
          onRetry: (attempt) => {
            console.log(`Bucket check retry attempt ${attempt}`);
          }
        }
      );
      
      if (result.error) {
        console.error(`Bucket '${BUCKET_NAME}' check failed:`, result.error);
        // Log more details about the error for troubleshooting
        console.error('Error details:', {
          message: result.error.message || 'Unknown error',
          status: result.error.status || 'unknown',
          details: result.error.details || 'none'
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
