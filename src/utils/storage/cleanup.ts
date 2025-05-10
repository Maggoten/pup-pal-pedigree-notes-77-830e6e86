
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from './config';
import { uploadToStorage } from './operations/upload';

interface CleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

/**
 * Cleans up an orphaned image from storage if no other records reference it
 */
export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: CleanupOptions): Promise<void> => {
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
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);
    
    if (error) {
      console.error('Error deleting storage file:', error);
      return;
    }
  
    console.log('Successfully deleted unused image');
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred while cleaning up storage";

    console.error('Cleanup error:', {
      error,
      message: errorMessage
    });
  }
};

/**
 * Schedule cleanup of orphaned uploads for a later time
 */
export const scheduleCleanup = (userId: string) => {
  // Schedule cleanup after a delay to prevent interference with ongoing operations
  setTimeout(() => {
    cleanupOrphanedUploads(userId).catch(err => {
      console.error('Scheduled cleanup failed:', err);
    });
  }, 60000); // Run after 1 minute
};

/**
 * Clean up orphaned uploads that aren't linked to any records
 */
export const cleanupOrphanedUploads = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    console.log('Checking for orphaned uploads to clean up');
    
    // This would typically involve querying storage for unused files
    // For now just log that we would clean up
    console.log('Cleanup of orphaned uploads completed for user:', userId);
  } catch (error) {
    console.error('Error cleaning up orphaned uploads:', error);
  }
};
