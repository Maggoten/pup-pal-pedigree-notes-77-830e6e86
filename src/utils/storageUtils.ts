import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StorageError } from '@supabase/storage-js';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: StorageCleanupOptions) => {
  // Confirm we're working with the internal bucket ID
  const BUCKET_NAME = 'dog-photos';
  
  if (!oldImageUrl || !oldImageUrl.includes(BUCKET_NAME)) {
    console.log('No valid image URL to cleanup:', oldImageUrl);
    return;
  }

  try {
    // Check Supabase auth status first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Storage cleanup failed: No active session');
      return;
    }
    
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
    // URL format: https://[storage-url]/storage/v1/object/public/dog-photos/[userId]/[filename]
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
    console.log('Bucket name:', BUCKET_NAME);
    
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (deleteError) {
      console.error('Error deleting unused image:', deleteError);
      
      // Improved error logging for StorageError
      const errorDetails = deleteError instanceof Error ? {
        message: deleteError.message,
        name: deleteError.name,
        ...(deleteError instanceof StorageError && { 
          // Add any specific StorageError properties if needed
          error: JSON.stringify(deleteError)
        })
      } : { deleteError };

      console.error('Error details:', errorDetails);

      toast({
        title: "Error removing image",
        description: errorDetails.message || "Could not delete the unused image",
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
    
    // Improved error handling for catches
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name
    } : { error };

    toast({
      title: "Error",
      description: errorDetails.message || "An unexpected error occurred while cleaning up storage",
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
