
import { supabase } from '@/integrations/supabase/client';
import { StorageError } from '@supabase/storage-js';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { BUCKET_NAME, STORAGE_ERRORS } from './config';

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
        { maxRetries: 2, initialDelay: 1000 }
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

// Basic upload function for storage
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
    console.log(`[Storage] Attempting to upload ${fileName} to bucket '${BUCKET_NAME}', size: ${file.size} bytes`);
    
    // Verify bucket exists before attempting upload
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Upload failed: Bucket '${BUCKET_NAME}' not found or not accessible`);
      throw new Error(STORAGE_ERRORS.BUCKET_NOT_FOUND(BUCKET_NAME));
    }
    
    // Upload with retry logic
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        }),
      { 
        maxRetries: 3, // Increased from 2 to 3 for better mobile resilience
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`Retrying upload to '${BUCKET_NAME}', attempt ${attempt}`);
          if (onProgress) onProgress(-1); // Signal retry to UI
        }
      }
    );
  } catch (error) {
    console.error(`Upload error to bucket '${BUCKET_NAME}':`, error);
    return { data: null, error: new StorageError(error instanceof Error ? error.message : 'Upload failed') };
  }
};

// Get public URL for a file
export const getPublicUrl = (fileName: string) => {
  return supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
};

// Remove file from storage with retries
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
    
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { maxRetries: 2, initialDelay: 1000 }
    );
  } catch (error) {
    console.error(`Remove from storage error (bucket '${BUCKET_NAME}'):`, error);
    throw error;
  }
};
