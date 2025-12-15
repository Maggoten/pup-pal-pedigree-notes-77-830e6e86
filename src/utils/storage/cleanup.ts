
import { supabase } from '@/integrations/supabase/client';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { BUCKET_NAME } from './config';
import { checkBucketExists } from './operations';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
  excludePuppyId?: string;
}

// Check if an image is used by any puppies owned by the user
const checkPuppiesUsingImage = async (imageUrl: string, userId: string, excludePuppyId?: string): Promise<boolean> => {
  try {
    // Find puppies using this image
    const { data: puppiesUsingImage, error: puppySearchError } = await supabase
      .from('puppies')
      .select('id, litter_id')
      .eq('image_url', imageUrl);

    if (puppySearchError) {
      console.error('Error checking puppies for image usage:', puppySearchError);
      return false; // Assume not in use on error
    }

    if (!puppiesUsingImage || puppiesUsingImage.length === 0) {
      return false;
    }

    // Filter out the excluded puppy if provided
    const otherPuppies = excludePuppyId 
      ? puppiesUsingImage.filter(p => p.id !== excludePuppyId)
      : puppiesUsingImage;

    if (otherPuppies.length === 0) {
      return false;
    }

    // Get unique litter IDs
    const litterIds = [...new Set(otherPuppies.map(p => p.litter_id))];

    // Check if any of these litters belong to the user
    const { data: userLitters, error: litterError } = await supabase
      .from('litters')
      .select('id')
      .in('id', litterIds)
      .eq('user_id', userId);

    if (litterError) {
      console.error('Error checking litter ownership:', litterError);
      return false;
    }

    if (!userLitters || userLitters.length === 0) {
      return false;
    }

    // Check if any puppies belong to user's litters
    const userLitterIds = userLitters.map(l => l.id);
    const ownedPuppiesUsingImage = otherPuppies.filter(p => 
      userLitterIds.includes(p.litter_id)
    );

    return ownedPuppiesUsingImage.length > 0;
  } catch (error) {
    console.error('Error in checkPuppiesUsingImage:', error);
    return false;
  }
};

// Check if an image is used by any dogs owned by the user
const checkDogsUsingImage = async (imageUrl: string, userId: string, excludeDogId?: string): Promise<boolean> => {
  try {
    const { data: dogsUsingImage, error: searchError } = await supabase
      .from('dogs')
      .select('id')
      .eq('image_url', imageUrl)
      .eq('owner_id', userId);

    if (searchError) {
      console.error('Error checking dogs for image usage:', searchError);
      return false;
    }

    if (!dogsUsingImage || dogsUsingImage.length === 0) {
      return false;
    }

    // Filter out the excluded dog if provided
    const otherDogs = excludeDogId 
      ? dogsUsingImage.filter(dog => dog.id !== excludeDogId)
      : dogsUsingImage;

    return otherDogs.length > 0;
  } catch (error) {
    console.error('Error in checkDogsUsingImage:', error);
    return false;
  }
};

// Improved cleanup with better error handling - checks both dogs and puppies
export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId, excludePuppyId }: StorageCleanupOptions) => {
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
    
    // Check if any dogs are using this image
    const dogsUsingImage = await checkDogsUsingImage(oldImageUrl, userId, excludeDogId);
    if (dogsUsingImage) {
      console.log('Image is still in use by other dogs, skipping deletion');
      return;
    }

    // Check if any puppies are using this image
    const puppiesUsingImage = await checkPuppiesUsingImage(oldImageUrl, userId, excludePuppyId);
    if (puppiesUsingImage) {
      console.log('Image is still in use by puppies, skipping deletion');
      return;
    }

    // Check if bucket exists and is accessible
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      console.error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      console.log('Skipping image deletion due to bucket access issues');
      return;
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
    
    // Don't throw, just log the error and allow the deletion to complete
  }
};

// Cleanup function specifically for puppy images
export const cleanupPuppyImage = async (imageUrl: string, userId: string, excludePuppyId: string) => {
  return cleanupStorageImage({
    oldImageUrl: imageUrl,
    userId,
    excludePuppyId
  });
};
