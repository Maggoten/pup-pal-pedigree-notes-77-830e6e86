
import { supabase } from '@/integrations/supabase/client';
import { StorageError } from '@supabase/storage-js';
import { fetchWithRetry, shouldRetryRequest, getDeviceAwareTimeout, isMobileDevice } from '@/utils/fetchUtils';
import { 
  BUCKET_NAME, 
  STORAGE_ERRORS,
  isSafari,
  getStorageTimeout
} from './config';

// Check if bucket exists and is accessible with retries
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Storage bucket check failed: No active session', sessionError);
      return false;
    }

    console.log(`Checking if bucket '${BUCKET_NAME}' exists...`);
    
    try {
      // Using our retry utility for more reliable bucket checking
      const result = await fetchWithRetry(
        () => supabase.storage.from(BUCKET_NAME).list('', { limit: 1 }),
        { 
          maxRetries: isSafari() ? 3 : 2, 
          initialDelay: isSafari() ? 2000 : 1000,
          onRetry: (attempt) => {
            console.log(`Bucket check retry attempt ${attempt} - Safari: ${isSafari()}`);
          }
        }
      );
      
      if (result.error) {
        console.error(`Bucket '${BUCKET_NAME}' check failed:`, result.error);
        return false;
      }
      
      console.log(`Bucket '${BUCKET_NAME}' exists, can list files:`, result.data);
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

// Safari-optimized upload function with enhanced retry logic
export const uploadToStorage = async (
  fileName: string, 
  file: File, 
  onProgress?: (progress: number) => void
) => {
  try {
    // First verify auth session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Upload failed: No active session');
      throw new Error(STORAGE_ERRORS.NO_SESSION);
    }
    
    // Log attempt for debugging
    console.log(`[Storage] Attempting to upload ${fileName} to bucket '${BUCKET_NAME}', size: ${file.size} bytes, browser: ${isSafari() ? 'Safari' : 'Other'}`);
    
    // Verify bucket exists before attempting upload
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Upload failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
      throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
    }
    
    // Adjust timeout and retry count for Safari
    const maxRetries = isSafari() || isMobileDevice() ? 4 : 3;
    const initialDelay = isSafari() ? 3000 : 2000;
    
    // Upload with enhanced retry logic for Safari
    return await fetchWithRetry(
      () => {
        // For Safari, we'll use a slightly different approach
        if (isSafari()) {
          console.log('Using Safari-optimized upload approach');
          // In Safari, sometimes the upload can stall, so we'll use a custom timeout
          return Promise.race([
            supabase.storage
              .from(BUCKET_NAME)
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
              }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Safari upload timeout')), getStorageTimeout())
            )
          ]);
        } else {
          // Standard upload for other browsers
          return supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
        }
      },
      { 
        maxRetries,
        initialDelay,
        useBackoff: true,
        onRetry: (attempt, error) => {
          console.log(`Retrying upload to '${BUCKET_NAME}', attempt ${attempt}, error:`, error);
          if (onProgress) onProgress(-1); // Signal retry to UI
        }
      }
    );
  } catch (error) {
    console.error(`Upload error to bucket '${BUCKET_NAME}':`, error);
    
    // Enhanced error reporting for Safari
    let errorMessage = error instanceof Error ? error.message : 'Upload failed';
    if (isSafari() && errorMessage.includes('timeout')) {
      errorMessage = 'Safari upload timed out. Please try again with a smaller file or using Chrome.';
    }
    
    return { 
      data: null, 
      error: new StorageError(errorMessage)
    };
  }
};

// Get public URL for a file - with Safari cache-busting when needed
export const getPublicUrl = (fileName: string) => {
  const result = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  
  // For Safari, add a cache-busting parameter to prevent caching issues
  if (isSafari() && result.data?.publicUrl) {
    const separator = result.data.publicUrl.includes('?') ? '&' : '?';
    result.data.publicUrl += `${separator}_t=${Date.now()}`;
  }
  
  return result;
};

// Remove file from storage with enhanced retry logic for Safari
export const removeFromStorage = async (storagePath: string) => {
  try {
    // Verify session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Remove failed: No active session');
      throw new Error(STORAGE_ERRORS.NO_SESSION);
    }
    
    // Verify bucket exists before attempting removal
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Remove failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
      throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
    }
    
    console.log(`[Storage] Attempting to remove ${storagePath} from bucket '${BUCKET_NAME}'`);
    
    // Use more retries for Safari
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { 
        maxRetries: isSafari() ? 3 : 2, 
        initialDelay: isSafari() ? 2000 : 1000,
        useBackoff: true
      }
    );
  } catch (error) {
    console.error(`Remove from storage error (bucket '${BUCKET_NAME}'):`, error);
    throw error;
  }
};
