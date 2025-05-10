import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, STORAGE_ERRORS, isImageByExtension } from '../config';
import { compressImage } from '../imageUtils';
import { checkBucketExists, createBucketIfNotExists } from '../operations';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { verifySession } from '@/utils/auth/sessionManager';
import { getPlatformInfo } from '../mobileUpload';
import { toast } from '@/hooks/use-toast';
import { hasError, formatStorageError, getStorageTimeout, safeGetErrorProperty, createStorageError } from '../imageUtils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Enhanced file upload function with compression, retry, and progress reporting
 */
export async function uploadImage(
  file: File, 
  options: {
    folder?: string;
    customFileName?: string;
    maxSizeMB?: number;
    skipCompression?: boolean;
    maxRetries?: number;
  } = {}
): Promise<string | null> {
  // Verify session before uploading
  const sessionValid = await verifySession({ skipThrow: true });
  if (!sessionValid) {
    throw new Error(STORAGE_ERRORS.NO_SESSION);
  }
  
  const { 
    folder = '', 
    customFileName, 
    maxSizeMB = 1,
    skipCompression = false,
    maxRetries = 2
  } = options;
  
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(STORAGE_ERRORS.FILE_TOO_LARGE(file.size));
    }
    
    if (!isImageByExtension(file.name) && !file.type.startsWith('image/')) {
      throw new Error(STORAGE_ERRORS.INVALID_FILE_TYPE);
    }
    
    // Check or create bucket
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      await createBucketIfNotExists();
    }
    
    // Setup storage path
    let fileName = customFileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storagePath = folder ? `${folder}/${fileName}` : fileName;
    
    console.log(`Processing ${file.name} (${Math.round(file.size / 1024)}KB) for upload to ${storagePath}`);
    
    // Try to compress image if it's not too small already
    let fileToUpload = file;
    if (!skipCompression && file.size > 300 * 1024) {
      try {
        // Fixed: Pass maxSizeMB directly as the second argument
        fileToUpload = await compressImage(file, maxSizeMB);
        console.log(`Compressed from ${Math.round(file.size / 1024)}KB to ${Math.round(fileToUpload.size / 1024)}KB`);
      } catch (compressionError) {
        console.warn('Image compression failed:', compressionError);
        console.log('Falling back to original file');
        fileToUpload = file;
      }
    }
    
    // Upload with retry
    console.log(`Uploading to ${storagePath}`);
    const platform = getPlatformInfo();
    let toastId: string | number | undefined;
    
    if (platform.mobile) {
      const toastResult = toast({
        title: "Uploading image...",
        description: "Please keep the app open",
        duration: 10000,
      });
      toastId = toastResult?.id;
    }
    
    const { data, error } = await fetchWithRetry(
      async () => {
        return await supabase.storage.from(BUCKET_NAME)
          .upload(storagePath, fileToUpload, {
            cacheControl: '3600',
            upsert: true
          });
      },
      {
        maxRetries,
        initialDelay: 1000,
        onRetry: (attempt) => {
          if (platform.mobile) {
            toast({
              title: `Retry ${attempt}/${maxRetries}`,
              description: "Slow connection detected. Please wait...",
            });
          }
          console.log(`Upload retry ${attempt} for ${storagePath}`);
        }
      }
    );
    
    if (toastId) {
      toast({
        title: error ? "Upload failed" : "Upload complete",
        description: error ? formatStorageError(error) : "Image uploaded successfully",
        duration: 3000,
      });
    }
    
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
      
    console.log('Upload successful, URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
    
  } catch (error: any) {
    console.error('Image upload failed:', error);
    const errorMessage = formatStorageError(error);
    
    toast({
      title: "Upload failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw error;
  }
}

/**
 * Upload a file to storage with enhanced retry logic and platform-specific optimizations
 * @param fileName The name to save the file as
 * @param file The file to upload
 * @returns Upload result with data or error
 */
export const uploadToStorage = async (
  fileName: string, 
  file: File
) => {
  const startTime = Date.now();
  const platform = getPlatformInfo();
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
  
  try {
    // Verify session and bucket exist
    try {
      // For mobile, skip session validation errors
      await verifySession({
        skipThrow: platform.mobile || platform.safari
      });
      
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        console.error(`Upload failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
        throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
      }
    } catch (error) {
      // For mobile, proceed even if pre-checks fail
      if (platform.mobile || platform.safari) {
        console.log('Pre-upload checks failed on mobile, but proceeding with upload anyway:', error);
      } else {
        console.error('Pre-upload checks failed:', error);
        throw error;
      }
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
    const maxRetries = platform.mobile || platform.safari ? 5 : 3;
    const initialDelay = platform.safari ? 4000 : 2000;
    
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
        onRetry: (attempt, error) => {
          console.log(`Retrying upload to '${BUCKET_NAME}', attempt ${attempt}, error:`, error);
        }
      }
    );
    
    // Log detailed response information
    logUploadDetails(fileName, file, result, startTime);
    
    if (hasError(result)) {
      console.error(`Upload error to bucket '${BUCKET_NAME}':`, result.error);
      
      // Enhanced error reporting
      let errorMessage = formatStorageError(result.error);
      if (platform.safari && errorMessage.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try a smaller file or switch browsers.';
      }
      
      return createStorageError(errorMessage);
    }
    
    return result;
    
  } catch (error) {
    console.error(`Upload error to bucket '${BUCKET_NAME}':`, error);
    
    // Enhanced error reporting for mobile/Safari
    let errorMessage = formatStorageError(error);
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
    success: !hasError(response),
    error: hasError(response) ? {
      message: safeGetErrorProperty(response.error, 'message', 'Unknown error'),
      status: safeGetErrorProperty(response.error, 'status', 'unknown'),
      details: safeGetErrorProperty(response.error, 'details', 'none')
    } : null,
    response: 'data' in response ? {
      path: response.data?.path || 'unknown'
    } : 'no data'
  });
};
