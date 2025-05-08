
import { supabase } from '@/integrations/supabase/client';
import { StorageError } from '@supabase/storage-js';
import { fetchWithRetry, shouldRetryRequest, getDeviceAwareTimeout, isMobileDevice } from '@/utils/fetchUtils';
import { 
  BUCKET_NAME, 
  STORAGE_ERRORS,
  isSafari,
  getStorageTimeout
} from './config';
import { getPlatformInfo } from './mobileUpload';

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
        // Log more details about the error for troubleshooting
        console.error('Error details:', {
          message: result.error.message,
          status: result.error.status || 'unknown',
          details: result.error.details || 'none'
        });
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

// Log detailed upload request and response information
const logUploadDetails = (fileName: string, file: File, response: any, startTime: number) => {
  const duration = Date.now() - startTime;
  const platform = getPlatformInfo();
  
  console.log('Upload details:', {
    fileName,
    fileSize: `${(file.size / 1024).toFixed(1)}KB`,
    fileType: file.type || 'unknown',
    duration: `${duration}ms`,
    platform: platform.device,
    safari: platform.safari,
    mobile: platform.mobile,
    success: !response.error,
    error: response.error ? {
      message: response.error.message,
      status: response.error.status || 'unknown',
      details: response.error.details || 'none'
    } : null,
    response: response.data ? {
      path: response.data.path || 'unknown'
    } : 'no data'
  });
};

// Safari-optimized upload function with enhanced retry logic
export const uploadToStorage = async (
  fileName: string, 
  file: File, 
  onProgress?: (progress: number) => void
) => {
  const startTime = Date.now();
  const platform = getPlatformInfo();
  
  try {
    // First verify auth session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Upload failed: No active session');
      throw new Error(STORAGE_ERRORS.NO_SESSION);
    }
    
    // Log attempt for debugging
    console.log(`[Storage] Attempting to upload ${fileName} to bucket '${BUCKET_NAME}'`, {
      size: `${(file.size / 1024).toFixed(1)}KB`,
      type: file.type || 'unknown',
      platform: platform.device,
      safari: platform.safari,
      mobile: platform.mobile
    });
    
    // Verify bucket exists before attempting upload
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Upload failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
      throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
    }
    
    // Adjust timeout and retry count for mobile/Safari
    const maxRetries = platform.mobile || platform.safari ? 4 : 3;
    const initialDelay = platform.safari ? 3000 : 2000;
    
    // Upload with enhanced retry logic
    const result = await fetchWithRetry(
      async () => {
        // Special handling for Safari and mobile devices
        if (platform.mobile || platform.safari) {
          console.log('Using mobile-optimized upload approach');
          
          // Use a custom timeout for mobile uploads
          const uploadPromise = supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          // Race against a timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Upload timeout after ${getStorageTimeout()}ms`)), 
            getStorageTimeout())
          );
          
          return Promise.race([uploadPromise, timeoutPromise]);
        } else {
          // Standard upload for desktop browsers
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
        shouldRetry: (error) => {
          // More selective retry logic for different error types
          if (error && typeof error === 'object' && 'statusCode' in error) {
            // Don't retry 413 (payload too large) errors
            if (error.statusCode === 413) return false;
            // Don't retry 400 errors that indicate malformed requests
            if (error.statusCode === 400 && error.message?.includes('Invalid')) return false;
          }
          return true;
        },
        onRetry: (attempt, error) => {
          console.log(`Retrying upload to '${BUCKET_NAME}', attempt ${attempt}, error:`, error);
          if (onProgress) onProgress(-1); // Signal retry to UI
        }
      }
    );
    
    // Log detailed response information
    logUploadDetails(fileName, file, result, startTime);
    
    if (result.error) {
      console.error(`Upload error to bucket '${BUCKET_NAME}':`, result.error);
      
      // Enhanced error reporting
      let errorMessage = result.error instanceof Error ? result.error.message : 'Upload failed';
      if (platform.safari && errorMessage.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try a smaller file or switch browsers.';
      }
      
      return { 
        data: null, 
        error: new StorageError(errorMessage, result.error.status, result.error.details)
      };
    }
    
    return result;
    
  } catch (error) {
    console.error(`Upload error to bucket '${BUCKET_NAME}':`, error);
    
    // Enhanced error reporting for mobile/Safari
    let errorMessage = error instanceof Error ? error.message : 'Upload failed';
    if (platform.mobile || platform.safari) {
      if (errorMessage.includes('timeout')) {
        errorMessage = `${platform.device} upload timed out. Try a smaller file (under 2MB).`;
      } else if (file.size > 3 * 1024 * 1024) { // 3MB
        errorMessage = `File may be too large (${(file.size/1024/1024).toFixed(1)}MB) for ${platform.device}.`;
      }
    }
    
    return { 
      data: null, 
      error: new StorageError(errorMessage)
    };
  }
};

// Get public URL for a file - with cache-busting when needed
export const getPublicUrl = (fileName: string) => {
  const result = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  
  // For Safari/mobile, add a cache-busting parameter
  if (isSafari() || isMobileDevice()) {
    if (result.data?.publicUrl) {
      const separator = result.data.publicUrl.includes('?') ? '&' : '?';
      result.data.publicUrl += `${separator}_t=${Date.now()}`;
    }
  }
  
  return result;
};

// Remove file from storage with enhanced retry logic
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
    
    // Use more retries for mobile/Safari
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { 
        maxRetries: isSafari() || isMobileDevice() ? 3 : 2, 
        initialDelay: isSafari() ? 2000 : 1000,
        useBackoff: true
      }
    );
  } catch (error) {
    console.error(`Remove from storage error (bucket '${BUCKET_NAME}'):`, error);
    throw error;
  }
};
