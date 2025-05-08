
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { StorageError } from '@supabase/storage-js';
import { validateImageFile } from '@/utils/imageValidation';
import { 
  BUCKET_NAME, 
  STORAGE_ERRORS,
  checkBucketExists, 
  uploadToStorage, 
  getPublicUrl, 
  removeFromStorage,
  processImageForUpload,
  isSafari
} from '@/utils/storage';
import { useUploadTimeout } from '@/hooks/useUploadTimeout';

interface UseImageUploadProps {
  user_id: string | undefined;
  onImageChange: (imageUrl: string) => void;
}

export const useImageUpload = ({ user_id, onImageChange }: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { startTimeout, clearTimeout } = useUploadTimeout(() => setIsUploading(false));
  const [uploadRetryCount, setUploadRetryCount] = useState(0);

  const uploadImage = async (file: File) => {
    if (!user_id) {
      console.error('Upload failed: No user ID provided');
      toast({
        title: "Authentication Error",
        description: "Please login again to upload images",
        variant: "destructive"
      });
      return;
    }
    
    // First validate the file - if it fails validation, stop here
    if (!validateImageFile(file)) return;
    
    setIsUploading(true);
    console.log(`Starting image upload to bucket: '${BUCKET_NAME}'`);
    
    try {
      // First check session and refresh if needed
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Try to refresh session
        console.log('No active session, attempting to refresh');
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          if (isSafari()) {
            // Special handling for Safari which has more session issues
            console.log('Safari detected, making extra refresh attempt');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondRefresh = await supabase.auth.refreshSession();
            if (!secondRefresh.data.session) {
              throw new Error('No active session. User authentication is required for uploads.');
            }
          } else {
            throw new Error('No active session. User authentication is required for uploads.');
          }
        }
      }
      
      console.log('Active session confirmed for user:', sessionData.session?.user.id);
      
      // Verify bucket exists before proceeding
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      let fileName = `${user_id}/${Date.now()}.${fileExt}`;
      
      // Add browser info to filename for troubleshooting
      if (isSafari()) {
        fileName = `${user_id}/${Date.now()}_safari.${fileExt}`;
      }
      
      // Start timeout monitor
      startTimeout();
      
      // Process the image (compress if on mobile or Safari)
      console.log('Processing image before upload...');
      const processedFile = await processImageForUpload(file);
      console.log(`Image processed: original size ${file.size} bytes, processed size ${processedFile.size} bytes`);

      // Upload with retry logic
      const maxRetries = isSafari() ? 3 : 2;
      let uploadResult;
      let retryCount = 0;
      let lastError;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`Upload attempt ${retryCount + 1}/${maxRetries + 1}`);
          uploadResult = await uploadToStorage(fileName, processedFile);
          
          if (!uploadResult.error) {
            console.log('Upload successful!');
            break;
          }
          
          lastError = uploadResult.error;
          console.log(`Upload attempt ${retryCount + 1} failed:`, lastError);
          
          // Check if it's worth retrying
          if (retryCount < maxRetries) {
            const retryDelay = 1000 * Math.pow(1.5, retryCount);
            console.log(`Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
          
          retryCount++;
        } catch (err) {
          lastError = err;
          console.error(`Upload attempt ${retryCount + 1} error:`, err);
          
          if (retryCount < maxRetries) {
            const retryDelay = 1000 * Math.pow(1.5, retryCount);
            console.log(`Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
          
          retryCount++;
        }
      }
      
      // Clear the upload timeout
      clearTimeout();
      
      // Handle final upload result
      if (!uploadResult || uploadResult.error) {
        const errorMessage = lastError instanceof StorageError 
          ? lastError.message 
          : "Could not upload the image";
        
        console.error('Final upload error:', {
          error: lastError,
          message: errorMessage,
          bucket: BUCKET_NAME
        });

        throw new Error(errorMessage);
      }
      
      console.log('Upload successful, getting public URL');
      
      // Get the public URL with cache busting for Safari
      const { data: { publicUrl } } = getPublicUrl(fileName);
      
      console.log('Generated public URL:', publicUrl);
      onImageChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
      
      setUploadRetryCount(0); // Reset retry counter on success
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      
      // More helpful error messages based on browser
      const friendlyMessage = isSafari() 
        ? "Safari upload issue. Try a smaller image or use Chrome."
        : errorMessage.includes("storage") 
          ? "Could not upload image. Please try again with a smaller file."
          : errorMessage;
      
      toast({
        title: "Upload Failed",
        description: friendlyMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      clearTimeout();
    }
  };

  const removeImage = async (imageUrl: string, userId: string) => {
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
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Try to refresh session
        console.log('No active session, attempting to refresh before image removal');
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          if (isSafari()) {
            // Extra attempt for Safari
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondRefresh = await supabase.auth.refreshSession();
            if (!secondRefresh.data.session) {
              throw new Error('No active session. User authentication is required.');
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
      
      // Remove file with retry for Safari
      const maxRetries = isSafari() ? 2 : 1;
      let retryCount = 0;
      let lastError;
      
      while (retryCount <= maxRetries) {
        try {
          const { error } = await removeFromStorage(storagePath);
          
          if (!error) {
            console.log('Image successfully removed');
            break;
          }
          
          lastError = error;
          
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          retryCount++;
        } catch (err) {
          lastError = err;
          
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          retryCount++;
        }
      }
      
      if (lastError) {
        console.error('Error removing image after all retries:', lastError);
        throw lastError;
      }
      
      onImageChange('');
      
      toast({
        title: "Image Removed",
        description: "Your image has been successfully removed"
      });
    } catch (error) {
      console.error('Error removing image:', error);
      
      toast({
        title: "Remove Failed",
        description: "Failed to remove image. The update will continue without removing the old image.",
        variant: "destructive"
      });
      onImageChange('');
    }
  };

  return {
    isUploading,
    uploadImage,
    removeImage
  };
};
