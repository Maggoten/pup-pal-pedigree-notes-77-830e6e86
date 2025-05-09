
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { 
  BUCKET_NAME,
  getSafeErrorMessage
} from '@/utils/storage/config';
import { 
  checkBucketExists,
  removeFromStorage
} from '@/utils/storage';

import { hasErrorProperty } from './types';

export const useImageRemoval = (onImageChange: (url: string) => void) => {
  const removeImage = async (imageUrl: string, userId: string) => {
    const platform = getPlatformInfo();
    
    if (!imageUrl || !imageUrl.includes(BUCKET_NAME) || !userId) {
      console.log('Skipping image removal: Invalid image URL or user ID', {
        imageUrl,
        userId,
        bucketInUrl: imageUrl ? imageUrl.includes(BUCKET_NAME) : false
      });
      onImageChange('');
      return;
    }
    
    try {
      // Verify session and refresh if needed
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error during removal:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!sessionData.session) {
        // Try to refresh session
        console.log('No active session, attempting to refresh before image removal');
        const refreshResult = await supabase.auth.refreshSession();
        const refreshError = refreshResult.error;
        const refreshData = refreshResult.data;
        
        if (refreshError) {
          console.error('Session refresh error during removal:', refreshError);
          throw new Error('Session refresh failed: ' + refreshError.message);
        }
        
        if (!refreshData.session) {
          if (platform.safari || platform.mobile) {
            // Extra attempt for mobile browsers
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondRefresh = await supabase.auth.refreshSession();
            if (!secondRefresh.data.session) {
              throw new Error('No active session after multiple refresh attempts. Please login again.');
            }
          } else {
            throw new Error('No active session. User authentication is required.');
          }
        }
      }
      
      // Verify bucket exists
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const storageIndex = urlParts.findIndex(part => part === BUCKET_NAME);
      
      if (storageIndex === -1) {
        console.log('No valid storage path found in URL:', imageUrl);
        onImageChange('');
        return;
      }
      
      const storagePath = urlParts.slice(storageIndex + 1).join('/');
      console.log('Removing image from storage path:', storagePath);
      
      // Remove file with enhanced logging
      const removeResult = await removeFromStorage(storagePath);
      
      if (hasErrorProperty(removeResult) && removeResult.error) {
        console.error('Error removing image:', removeResult.error);
        throw removeResult.error;
      }
      
      console.log('Image successfully removed');
      onImageChange('');
      
      toast({
        title: "Image Removed",
        description: "Your image has been successfully removed"
      });
    } catch (error) {
      console.error('Error removing image:', error);
      
      // Don't block UI flow even if removal fails
      toast({
        title: "Remove Failed",
        description: "Failed to remove image. The update will continue without removing the old image.",
        variant: "destructive"
      });
      onImageChange('');
    }
  };

  return { removeImage };
};
