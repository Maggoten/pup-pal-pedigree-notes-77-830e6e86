
import { supabase } from '@/integrations/supabase/client';
import { StorageError } from '@supabase/storage-js';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { 
  BUCKET_NAME, 
  STORAGE_ERROR_CODES as STORAGE_ERRORS,
  getStorageTimeout,
  isStorageError,
  getSafeErrorMessage
} from '../config';
import { getPlatformInfo } from '../mobileUpload';
import { checkBucketExists } from '../core/bucket';
import { verifySession } from '../core/session';
import { hasError, safeGetErrorProperty, createStorageError, formatStorageError } from '../core/errors';

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

/**
 * Upload a file to storage with enhanced retry logic and platform-specific optimizations
 * @param fileName The name to save the file as
 * @param file The file to upload
 * @param onProgress Optional progress callback
 * @returns Upload result with data or error
 */
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

    // Make the session verification error more visible for debugging
    if (sessionError) {
      console.error('Session error before upload:', sessionError);
      throw new Error(`Authentication error: ${sessionError.message || 'No active session'}`);
    }
    
    if (!sessionData.session) {
      console.error('Upload failed: No active session');
      throw new Error(STORAGE_ERRORS.NO_SESSION);
    } else {
      console.log('Using active session for upload:', {
        userId: sessionData.session.user.id,
        expiresAt: sessionData.session.expires_at
      });
    }
    
    // Verify bucket exists before attempting upload
    try {
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        console.error(`Upload failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
        throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
      }
    } catch (bucketError) {
      console.error('Error checking bucket:', bucketError);
      // Convert to a readable error message
      throw new Error(`Storage bucket error: ${bucketError instanceof Error ? bucketError.message : 'Could not access storage bucket'}`);
    }
    
    // Log attempt for debugging
    console.log(`[Storage] Attempting to upload ${fileName} to bucket '${BUCKET_NAME}'`, {
      size: `${fileSizeMB}MB (${file.size} bytes)`,
      type: file.type || 'unknown',
      platform: platform.device,
      safari: platform.safari,
      mobile: platform.mobile
    });
    
    // Adjust timeout and retry count for mobile/Safari
    // Increased maxRetries from 4 to 5 for mobile
    const maxRetries = platform.mobile || platform.safari ? 5 : 3;
    // Increased initial delay from 3000ms to 4000ms for Safari
    const initialDelay = platform.safari ? 4000 : 2000;
    
    // Upload with enhanced retry logic
    const result = await fetchWithRetry(
      async () => {
        console.log(`Making upload request for file: ${fileName} (${fileSizeMB}MB)`);
        
        // Custom timeout for mobile uploads
        const uploadPromise = supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        // Race against a timeout - Increased timeout for mobile
        // Get from config but ensure it's at least 60 seconds on mobile
        const configTimeout = getStorageTimeout();
        const timeout = platform.mobile ? Math.max(configTimeout, 60000) : configTimeout;
        console.log(`Setting timeout for upload: ${timeout}ms`);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Upload timeout after ${timeout}ms`)), timeout)
        );
        
        return Promise.race([uploadPromise, timeoutPromise]);
      },
      { 
        maxRetries,
        initialDelay,
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
            // Don't retry permission errors
            if (('message' in error && typeof (error as any).message === 'string' && 
                ((error as any).message.includes('permission') || (error as any).message.includes('not authorized')))) {
              console.log('Will not retry permission-related error');
              return false;
            }
          }
          console.log('Will retry upload');
          return true;
        },
        onRetry: (attempt) => {
          console.log(`Retrying upload to '${BUCKET_NAME}', attempt ${attempt}`);
          if (onProgress) onProgress(-1); // Signal retry to UI
        }
      }
    );
    
    // Log detailed response information
    logUploadDetails(fileName, file, result, startTime);
    
    if (hasError(result) && result.error) {
      // Detailed error logging
      console.error(`Upload error to bucket '${BUCKET_NAME}':`, result.error);
      console.error('Error details:', {
        message: safeGetErrorProperty(result.error, 'message', 'Unknown error'),
        statusCode: safeGetErrorProperty(result.error, 'statusCode', 'unknown'),
        status: safeGetErrorProperty(result.error, 'status', 'unknown'),
        error: safeGetErrorProperty(result.error, 'error', 'unknown')
      });
      
      // Enhanced error reporting
      let errorMessage = formatStorageError(result.error);
      if (platform.safari && errorMessage.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try a smaller file or switch browsers.';
      } else if (errorMessage.includes('not authorized')) {
        errorMessage = 'You are not authorized to upload to this storage bucket. Please check permissions.';
      }
      
      return createStorageError(errorMessage);
    }
    
    return result;
    
  } catch (error) {
    console.error(`Upload error to bucket '${BUCKET_NAME}':`, error);
    
    // More descriptive error messages
    let errorMessage = formatStorageError(error);
    if (typeof error === 'object' && error !== null) {
      if ('code' in error && (error as any).code === 'PGRST301') {
        errorMessage = 'Storage permissions denied. Please check bucket policies.';
      } else if ('code' in error && (error as any).code === '42501') { 
        errorMessage = 'Database permissions error. You may not have the right access level.';
      }
    }
    
    // Platform-specific error messages
    if (platform.mobile || platform.safari) {
      if (errorMessage.includes('timeout')) {
        errorMessage = `${platform.device} upload timed out. Try a smaller file (under 2MB).`;
      } else if (file.size > 3 * 1024 * 1024) { // 3MB
        errorMessage = `File may be too large (${(file.size/1024/1024).toFixed(1)}MB) for ${platform.device}.`;
      }
    }
    
    return createStorageError(errorMessage);
  }
};
