
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME, STORAGE_ERRORS } from './config';
import { isSafari, getStorageTimeout } from './config';
import { fetchWithRetry, isMobileDevice } from '@/utils/fetchUtils';
import { verifySession } from '../auth/sessionManager';
import { getPlatformInfo } from './mobileUpload';

/**
 * Checks if a storage bucket exists and is accessible
 */
export async function checkBucketExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      console.error('Failed to check bucket:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking bucket:', error);
    return false;
  }
}

/**
 * Creates a bucket if it doesn't exist
 */
export async function createBucketIfNotExists(): Promise<boolean> {
  try {
    // First check if bucket exists
    const exists = await checkBucketExists();
    
    if (exists) {
      console.log(`Bucket ${BUCKET_NAME} already exists`);
      return true;
    }
    
    // Attempt to create the bucket with sensible defaults
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false, // Make private by default
      fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
    });
    
    if (error) {
      console.error('Failed to create bucket:', error);
      return false;
    }
    
    console.log(`Created bucket ${BUCKET_NAME}`);
    return true;
  } catch (error) {
    console.error('Error creating bucket:', error);
    return false;
  }
}

/**
 * Uploads a file to storage with improved resilience
 */
export async function uploadFile(
  file: File,
  path: string = '',
  options: {
    maxRetries?: number;
    useCompression?: boolean;
  } = {}
): Promise<string | null> {
  // Verify session is valid before uploading
  const isSessionValid = await verifySession({ skipThrow: true });
  if (!isSessionValid) {
    throw new Error('Authentication required for file upload');
  }
  
  const { maxRetries = 2 } = options;
  const platform = getPlatformInfo();
  
  try {
    // Make sure bucket exists
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      const created = await createBucketIfNotExists();
      if (!created) {
        throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
      }
    }
    
    // Generate a unique file path if none provided
    const filePath = path || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    console.log(`Uploading file to ${BUCKET_NAME}/${filePath}`);
    
    // Use the fetchWithRetry utility for better resilience
    const { data, error } = await fetchWithRetry(
      async () => {
        return await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
      },
      {
        maxRetries: maxRetries,
        initialDelay: 2000,
        useBackoff: true,
        onRetry: (attempt) => {
          console.log(`Retry attempt ${attempt} for file upload`);
        }
      }
    );
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    if (data) {
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      
      console.log('Upload successful, public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Deletes a file from storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  // Verify session is valid before deleting
  const isSessionValid = await verifySession({ skipThrow: true });
  if (!isSessionValid) {
    throw new Error('Authentication required for file deletion');
  }
  
  try {
    console.log(`Deleting file ${BUCKET_NAME}/${filePath}`);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
    
    console.log('Delete successful');
    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

/**
 * Downloads a file from storage
 */
export async function downloadFile(filePath: string): Promise<File | null> {
  // Verify session is valid before downloading
  const isSessionValid = await verifySession({ skipThrow: true });
  if (!isSessionValid) {
    throw new Error('Authentication required for file download');
  }
  
  try {
    console.log(`Downloading file ${BUCKET_NAME}/${filePath}`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);
    
    if (error) {
      console.error('Download error:', error);
      throw error;
    }
    
    if (data) {
      console.log('Download successful');
      // Convert blob to File with name
      const filename = filePath.split('/').pop() || 'downloaded-file';
      // Create a new File from the blob
      return new File([data], filename, { 
        type: data.type,
        lastModified: Date.now()
      });
    }
    
    return null;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Lists all files in a storage bucket
 */
export async function listFiles(path: string = ''): Promise<any[]> {
  // Verify session is valid before listing files
  const isSessionValid = await verifySession({ skipThrow: true });
  if (!isSessionValid) {
    throw new Error('Authentication required for listing files');
  }
  
  try {
    console.log(`Listing files in ${BUCKET_NAME}/${path}`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path);
    
    if (error) {
      console.error('List error:', error);
      throw error;
    }
    
    console.log('List successful');
    return data || [];
  } catch (error) {
    console.error('List failed:', error);
    throw error;
  }
}
