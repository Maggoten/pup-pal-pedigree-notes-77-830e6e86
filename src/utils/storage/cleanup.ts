
import { supabase } from '@/integrations/supabase/client';
import { BUCKET_NAME } from './config';
import { deleteStorageObject } from './operations/remove';
import { isValidPublicUrl } from './operations/validate';

/**
 * Interface for image cleanup options
 */
export interface CleanupImageOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

/**
 * Cleans up a storage image based on its URL
 * @param options String URL or cleanup options object
 */
export const cleanupStorageImage = async (options: string | CleanupImageOptions): Promise<boolean> => {
  // Handle both string and object format for backward compatibility
  const imageUrl = typeof options === 'string' ? options : options.oldImageUrl;

  if (!imageUrl || !isValidPublicUrl(imageUrl)) {
    console.log('No valid image URL to clean up');
    return false;
  }
  
  try {
    // Extract path from URL - this is a simplified approach
    const urlObj = new URL(imageUrl);
    const path = urlObj.pathname.split('/').slice(-2).join('/'); // Get last two segments which should be userId/filename
    
    if (!path) {
      console.warn('Could not extract valid path from image URL:', imageUrl);
      return false;
    }
    
    // Delete the object
    const result = await deleteStorageObject(path);
    return !result.error;
  } catch (error) {
    console.error('Failed to clean up storage image:', error);
    return false;
  }
};

/**
 * Cleans up orphaned uploads that are no longer referenced
 */
export const cleanupOrphanedUploads = async (userId: string): Promise<number> => {
  // This would typically query the database to find orphaned files
  // and remove them, but for now we'll just return a placeholder
  console.log('Cleanup for user', userId, 'would happen here');
  return 0;
};

/**
 * Schedules a cleanup job to run periodically
 */
export const scheduleCleanup = (intervalMs: number = 24 * 60 * 60 * 1000): () => void => {
  const timer = setInterval(() => {
    console.log('Scheduled cleanup would run here');
  }, intervalMs);
  
  // Return a function to cancel the scheduled cleanup
  return () => clearInterval(timer);
};
