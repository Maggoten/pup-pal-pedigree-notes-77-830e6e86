
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { BUCKET_NAME } from './config';
import { checkBucketExists } from './operations';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

// Improved cleanup with better error handling
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
    
    await fetchWithRetry(
      () => supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]),
      { maxRetries: 1, initialDelay: 1000 }
    );
  
    console.log('Successfully deleted unused image');
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
