
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

    console.log('Checking if bucket exists:', BUCKET_NAME);
    
    try {
      // Using our retry utility for more reliable bucket checking
      const result = await fetchWithRetry(
        () => supabase.storage.from(BUCKET_NAME).list('', { limit: 1 }),
        { maxRetries: 2, initialDelay: 1000 }
      );
      
      if (result.error) {
        console.error('Error checking bucket existence:', result.error);
        return false;
      }
      
      console.log('Bucket exists, can list files:', result.data);
      return true;
    } catch (listError) {
      console.error('Error or timeout when listing bucket contents:', listError);
      return false;
    }
  } catch (err) {
    console.error('Error in bucket verification:', err);
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
      throw new Error(STORAGE_ERRORS.NO_SESSION);
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
        maxRetries: 2,
        initialDelay: 2000,
        onRetry: (attempt) => {
          console.log(`Retrying upload attempt ${attempt}`);
          if (onProgress) onProgress(-1); // Signal retry to UI
        }
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return { data: null, error: new StorageError('Upload failed') };
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
      throw new Error(STORAGE_ERRORS.NO_SESSION);
    }
    
    return await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { maxRetries: 1, initialDelay: 1000 }
    );
  } catch (error) {
    console.error('Remove from storage error:', error);
    throw error;
  }
};
