
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: StorageCleanupOptions) => {
  if (!oldImageUrl || !oldImageUrl.includes('Dog Photos')) {
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
      toast({
        title: "Error checking image usage",
        description: "Could not verify if the image is still in use",
        variant: "destructive"
      });
      return;
    }

    // If other dogs are using this image, don't delete it
    if (dogsUsingImage && dogsUsingImage.length > 0) {
      console.log('Image is still in use by other dogs, skipping deletion');
      return;
    }

    // Extract the path from the URL
    // URL format: https://[storage-url]/storage/v1/object/public/Dog Photos/[userId]/[filename]
    const urlParts = oldImageUrl.split('/');
    const storagePath = urlParts
      .slice(urlParts.findIndex(part => part === 'Dog Photos'))
      .join('/');

    console.log('Deleting unused image:', storagePath);
    
    const { error: deleteError } = await supabase.storage
      .from('Dog Photos')
      .remove([storagePath]);

    if (deleteError) {
      console.error('Error deleting unused image:', deleteError);
      toast({
        title: "Error removing image",
        description: "Could not delete the unused image",
        variant: "destructive"
      });
      return;
    }

    console.log('Successfully deleted unused image');
    toast({
      title: "Success",
      description: "Unused image was successfully removed",
    });
  } catch (error) {
    console.error('Error in storage cleanup:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while cleaning up storage",
      variant: "destructive"
    });
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
