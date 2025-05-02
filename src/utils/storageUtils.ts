
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StorageError } from '@supabase/storage-js';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

const BUCKET_NAME = 'dog-photos';

// Check if bucket exists and is accessible
const checkBucketExists = async (): Promise<boolean> => {
  try {
    // First check if user has a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('Storage bucket check failed: No active session', sessionError);
      return false;
    }

    console.log('Checking if bucket exists:', BUCKET_NAME);
    
    // Try to list files in the bucket to verify access
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // Using a timeout-based approach with Promise.race instead
      const listPromise = supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });
      
      const result = await Promise.race([
        listPromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Bucket check timed out')), 5000);
        })
      ]);
      
      clearTimeout(timeoutId);
      
      // TypeScript now knows this is the result of the storage call
      const { data, error } = result as Awaited<typeof listPromise>;
      
      if (error) {
        console.error('Error checking bucket existence:', error);
        return false;
      }
      
      console.log('Bucket exists, can list files:', data);
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

export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: StorageCleanupOptions) => {
  if (!oldImageUrl || !oldImageUrl.includes(BUCKET_NAME)) {
    console.log('No valid image URL to cleanup:', oldImageUrl);
    return;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Storage cleanup failed: No active session');
      return;
    }
    
    // Check if other dogs are using the same image before deleting
    const { data: dogsUsingImage, error: searchError } = await supabase
      .from('dogs')
      .select('id')
      .eq('image_url', oldImageUrl)
      .eq('owner_id', userId);
    
    // If excludeDogId is provided, filter it out from the results
    const otherDogsUsingImage = dogsUsingImage ? 
      dogsUsingImage.filter(dog => dog.id !== excludeDogId) : 
      [];

    if (searchError) {
      console.error('Error checking for image usage:', searchError);
      return;
    }

    if (otherDogsUsingImage && otherDogsUsingImage.length > 0) {
      console.log('Image is still in use by other dogs, skipping deletion', otherDogsUsingImage);
      return;
    }

    // Check if bucket exists and is accessible
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      console.log('Skipping image deletion due to bucket access issues');
      return; // Just return without throwing, let the dog deletion complete
    }
    
    console.log(`Bucket "${BUCKET_NAME}" exists and is accessible, proceeding with deletion`);

    // Extract the storage path from the URL
    const urlParts = oldImageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.error('Could not find bucket name in URL:', oldImageUrl);
      return;
    }
    
    const storagePath = urlParts
      .slice(bucketIndex + 1)
      .join('/');

    console.log('Deleting unused image:', storagePath);
    
    // Set a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // Using a timeout-based approach with Promise.race instead
      const removePromise = supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);
      
      const result = await Promise.race([
        removePromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Delete operation timed out')), 10000);
        })
      ]);
  
      clearTimeout(timeoutId);
      
      // TypeScript now knows this is the result of the storage call
      const { error: deleteError } = result as Awaited<typeof removePromise>;
  
      if (deleteError) {
        console.error('Delete error:', {
          error: deleteError,
          message: deleteError instanceof StorageError ? deleteError.message : 'Unknown error',
          status: deleteError instanceof Error ? deleteError.name : 'unknown'
        });
        return; // Just return, don't throw
      }
  
      console.log('Successfully deleted unused image');
    } catch (abortError) {
      console.error('Image deletion timed out or was aborted:', abortError);
      // Continue with the flow, don't break the process
    }
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred while cleaning up storage";

    console.error('Cleanup error:', {
      error,
      message: errorMessage
    });
    
    // Don't throw, just log the error and allow the dog deletion to complete
  }
};

export const cleanupAllUnusedPhotos = async () => {
  try {
    // Check if bucket exists and is accessible first
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
    }
    
    const { data, error } = await supabase.functions.invoke('cleanup-photos', {
      method: 'POST'
    });

    if (error) {
      console.error('Error cleaning up photos:', error);
      throw error;
    }

    console.log('Photos cleanup completed:', data);
    return data;
  } catch (error) {
    console.error('Error in cleanupAllUnusedPhotos:', error);
    throw error;
  }
};
