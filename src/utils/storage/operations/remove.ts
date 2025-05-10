
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, STORAGE_ERRORS } from '../config'; 
import { fetchWithRetry } from '@/utils/fetchUtils';
import { getPlatformInfo } from '../mobileUpload';
import { checkBucketExists } from '../core/bucket';
import { verifyStorageSession } from '../core/session';
import { hasError } from '../core/errors';

/**
 * Remove image from storage
 * @param imageUrl URL of the image to remove
 */
export const removeImage = async (imageUrl: string): Promise<{ data: any; error: any } | null> => {
  if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) {
    console.log('No valid image URL to remove:', imageUrl);
    return null;
  }

  try {
    // Extract the storage path from the URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.error('Could not find bucket name in URL:', imageUrl);
      return { data: null, error: { message: 'Invalid storage URL' } };
    }
    
    const storagePath = urlParts
      .slice(bucketIndex + 1)
      .join('/');
      
    return await removeFromStorage(storagePath);
  } catch (error) {
    console.error('Error removing image:', error);
    return { data: null, error };
  }
};

/**
 * Delete a specific object from storage
 */
export const deleteStorageObject = async (path: string): Promise<{ data: any; error: any }> => {
  return await removeFromStorage(path);
};

/**
 * Remove file from storage with enhanced retry logic
 * @param storagePath Path to the file in storage
 * @returns Result with data or error
 */
export const removeFromStorage = async (storagePath: string) => {
  try {
    const platform = getPlatformInfo();
    
    // Verify session first
    try {
      await verifyStorageSession();
      
      // Verify bucket exists before attempting removal
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        console.error(`Remove failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
        throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
      }
    } catch (error) {
      console.error('Pre-remove checks failed:', error);
      throw error;
    }
    
    console.log(`[Storage] Attempting to remove ${storagePath} from bucket '${BUCKET_NAME}'`);
    
    // Use more retries for mobile/Safari
    const result = await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { 
        maxRetries: platform.safari || platform.mobile ? 3 : 2, 
        initialDelay: platform.safari ? 2000 : 1000,
        useBackoff: true
      }
    );
    
    // Safely check for errors
    if (hasError(result) && result.error) {
      console.error(`Error removing file from '${BUCKET_NAME}':`, result.error);
      return {
        data: null,
        error: result.error
      };
    }
    
    return result;
  } catch (error) {
    console.error(`Remove from storage error (bucket '${BUCKET_NAME}'):`, error);
    throw error;
  }
};
