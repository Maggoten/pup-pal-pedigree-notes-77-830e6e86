
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StorageError } from '@supabase/storage-js';

interface StorageCleanupOptions {
  oldImageUrl: string;
  userId: string;
  excludeDogId?: string;
}

export const cleanupStorageImage = async ({ oldImageUrl, userId, excludeDogId }: StorageCleanupOptions) => {
  const BUCKET_NAME = 'dog-photos';
  
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

    if (dogsUsingImage && dogsUsingImage.length > 0) {
      console.log('Image is still in use by other dogs, skipping deletion');
      return;
    }

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      throw bucketError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.id === BUCKET_NAME);
    if (!bucketExists) {
      console.error(`Bucket "${BUCKET_NAME}" does not exist in available buckets:`, 
        buckets.map(b => b.id));
      throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist`);
    }
    
    console.log(`Found bucket "${BUCKET_NAME}", proceeding with deletion`);

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
      const errorMessage = deleteError instanceof StorageError 
        ? deleteError.message 
        : "Could not delete the unused image";

      console.error('Delete error:', {
        error: deleteError,
        message: errorMessage,
        details: deleteError instanceof StorageError ? deleteError.message : 'Unknown error',
        status: deleteError instanceof Error ? deleteError.name : 'unknown'
      });

      toast({
        title: "Error removing image",
        description: errorMessage,
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
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred while cleaning up storage";

    console.error('Cleanup error:', {
      error,
      message: errorMessage,
      status: error instanceof Error && 'name' in error ? (error as any).name : 'unknown'
    });

    toast({
      title: "Error",
      description: errorMessage,
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
