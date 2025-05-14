
import { supabase } from '@/integrations/supabase/client';
import { StorageError } from '@supabase/storage-js';
import { fetchWithRetry, shouldRetryRequest, getDeviceAwareTimeout, isMobileDevice } from '@/utils/fetchUtils';
import { 
  BUCKET_NAME, 
  STORAGE_ERRORS,
  isSafari,
  getStorageTimeout,
  isStorageError,
  isSupabaseStorageError,
  getSafeErrorMessage,
  StorageErrorDetails,
  SupabaseStorageError,
  isApiErrorResponse,
  ApiErrorResponse
} from './config';
import { getPlatformInfo } from './mobileUpload';

// Safe error property access helper
const safeGetErrorProperty = <T>(error: unknown, property: string, defaultValue: T): T => {
  if (error && typeof error === 'object' && property in error) {
    return (error as any)[property];
  }
  return defaultValue;
};

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

// Log detailed upload request and response information
const logUploadDetails = (fileName: string, file: File, response: any, startTime: number) => {
  const duration = Date.now() - startTime;
  const platform = getPlatformInfo();
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
  
  console.log('Upload details:', {
    fileName,
    fileSize: `${fileSizeMB}MB (${file.size} bytes)`,
    fileType: file.type || 'unknown',
    duration: `${duration}ms`,
    platform: platform.device,
    safari: platform.safari,
    mobile: platform.mobile,
    success: !response.error,
    error: response.error ? {
      message: safeGetErrorProperty(response.error, 'message', 'Unknown error'),
      status: safeGetErrorProperty(response.error, 'status', 'unknown'),
      details: safeGetErrorProperty(response.error, 'details', 'none')
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
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
  
  try {
    // First verify auth session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error before upload:', sessionError);
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    if (!sessionData.session) {
      console.error('Upload failed: No active session');
      
      // Try to refresh session for Safari users
      if (platform.safari || platform.mobile) {
        console.log(`${platform.device} detected: Attempting to refresh session before upload`);
        const refreshResult = await supabase.auth.refreshSession();
        
        if (refreshResult.error || !refreshResult.data.session) {
          console.error('Session refresh failed:', refreshResult.error);
          throw new Error(STORAGE_ERRORS.NO_SESSION);
        } else {
          console.log('Session successfully refreshed');
        }
      } else {
        throw new Error(STORAGE_ERRORS.NO_SESSION);
      }
    } else {
      console.log('Using active session for upload:', {
        userId: sessionData.session.user.id,
        expiresAt: sessionData.session.expires_at
      });
    }
    
    // Log attempt for debugging
    console.log(`[Storage] Attempting to upload ${fileName} to bucket '${BUCKET_NAME}'`, {
      size: `${fileSizeMB}MB (${file.size} bytes)`,
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
        console.log(`Making upload request for file: ${fileName} (${fileSizeMB}MB)`);
        
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
          const timeout = getStorageTimeout();
          console.log(`Setting timeout for upload: ${timeout}ms`);
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Upload timeout after ${timeout}ms`)), timeout)
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
          console.log('Evaluating if upload error should trigger retry:', error);
          
          // More selective retry logic for different error types
          if (error && typeof error === 'object') {
            // Don't retry 413 (payload too large) errors
            if (('status' in error && (error as any).status === 413) || 
                ('statusCode' in error && (error as any).statusCode === 413)) {
              console.log('Will not retry 413 Payload Too Large error');
              return false;
            }
            // Don't retry 400 errors that indicate malformed requests
            if ((('status' in error && (error as any).status === 400) || 
                 ('statusCode' in error && (error as any).statusCode === 400)) && 
                 'message' in error && typeof (error as any).message === 'string' &&
                 (error as any).message.includes('Invalid')) {
              console.log('Will not retry 400 Invalid Request error');
              return false;
            }
          }
          console.log('Will retry upload');
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
    
    // Type guard check for error property
    if (hasError(result) && result.error) {
      console.error(`Upload error to bucket '${BUCKET_NAME}':`, result.error);
      
      // Enhanced error reporting
      let errorMessage = getSafeErrorMessage(result.error);
      if (platform.safari && errorMessage.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try a smaller file or switch browsers.';
      }
      
      return { 
        data: null, 
        error: new StorageError(errorMessage) 
      };
    }
    
    return result;
    
  } catch (error) {
    console.error(`Upload error to bucket '${BUCKET_NAME}':`, error);
    
    // Enhanced error reporting for mobile/Safari
    let errorMessage = getSafeErrorMessage(error);
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

// Type guard for response objects that have an error property
const hasError = (obj: unknown): obj is { error: unknown } => {
  return obj !== null && 
         typeof obj === 'object' && 
         'error' in obj;
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
    const result = await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { 
        maxRetries: isSafari() || isMobileDevice() ? 3 : 2, 
        initialDelay: isSafari() ? 2000 : 1000,
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
