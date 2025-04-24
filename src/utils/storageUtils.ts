
import { supabase } from '@/integrations/supabase/client';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: StorageCleanupOptions) => {
  if (!oldImageUrl || !oldImageUrl.includes('dog-photos')) {
    console.log('No valid image URL to cleanup:', oldImageUrl);
    return;
  }

  try {
    // First check if any other dogs are using this image
    const { data: dogsUsingImage, error: searchError } = await supabase
      .from('dogs')
      .select('id')
      .eq('image_url', oldImageUrl)
      .eq('owner_id', userId)
      .neq('id', excludeDogId || '');

    if (searchError) {
      console.error('Error checking for image usage:', searchError);
      return;
    }

    // If other dogs are using this image, don't delete it
    if (dogsUsingImage && dogsUsingImage.length > 0) {
      console.log('Image is still in use by other dogs, skipping deletion');
      return;
    }

    // Extract the path from the URL
    // URL format: https://[storage-url]/storage/v1/object/public/dog-photos/[userId]/[filename]
    const urlParts = oldImageUrl.split('/');
    const storagePath = urlParts
      .slice(urlParts.findIndex(part => part === 'dog-photos'))
      .join('/');

    console.log('Deleting unused image:', storagePath);
    
    const { error: deleteError } = await supabase.storage
      .from('dog-photos')
      .remove([storagePath]);

    if (deleteError) {
      console.error('Error deleting unused image:', deleteError);
      return;
    }

    console.log('Successfully deleted unused image');
  } catch (error) {
    console.error('Error in storage cleanup:', error);
  }
};

export const cleanupAllUnusedPhotos = async () => {
  try {
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
