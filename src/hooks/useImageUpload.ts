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
    
    if (!validateImageFile(file)) return;
    
    setIsUploading(true);
    console.log(`Starting image upload to bucket: '${BUCKET_NAME}'`);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Try to refresh session if in Safari
        if (isSafari()) {
          console.log('Safari detected, attempting session refresh before upload');
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (!refreshData.session) {
            throw new Error('No active session. User authentication is required for uploads.');
          }
        } else {
          throw new Error('No active session. User authentication is required for uploads.');
        }
      }
      console.log('Active session found for user:', sessionData.session.user.id);
      
      // Verify bucket exists before proceeding
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      const fileExt = file.name.split('.').pop() || 'jpg';
      let fileName = `${user_id}/${Date.now()}.${fileExt}`;
      
      // Add browser info to filename for debugging
      if (isSafari()) {
        fileName = `${user_id}/${Date.now()}_safari.${fileExt}`;
      }
      
      startTimeout();
      
      // Process the image (compress if on mobile or Safari)
      const processedFile = await processImageForUpload(file);

      // Call uploadToStorage
      let uploadResult;
      let retryCount = 0;
      const maxRetries = isSafari() ? 3 : 2;
      
      while (retryCount < maxRetries) {
        try {
          uploadResult = await uploadToStorage(fileName, processedFile);
          if (!uploadResult.error) break;
          
          console.log(`Upload attempt ${retryCount + 1} failed, trying again...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
          console.error(`Upload attempt ${retryCount + 1} error:`, err);
          retryCount++;
          if (retryCount >= maxRetries) throw err;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      clearTimeout();
      
      if (!uploadResult || uploadResult.error) {
        const errorMessage = uploadResult?.error instanceof StorageError 
          ? uploadResult.error.message 
          : "Could not upload the image";
        
        console.error('Upload error:', {
          error: uploadResult?.error,
          message: errorMessage,
          bucket: BUCKET_NAME,
          details: uploadResult?.error instanceof StorageError ? uploadResult.error.message : 'Unknown error'
        });

        throw new Error(errorMessage);
      }
      
      console.log('Upload successful, getting public URL');
      
      const { data: { publicUrl } } = getPublicUrl(fileName);
      
      console.log('Generated public URL:', publicUrl);
      onImageChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      
      // Special handling for Safari
      const safariFriendlyMessage = isSafari() 
        ? "Safari upload issue. Try a smaller image or use Chrome."
        : errorMessage;
      
      toast({
        title: "Upload Failed",
        description: safariFriendlyMessage,
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
      // Verify session and refresh if in Safari
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (isSafari()) {
          console.log('Safari detected, attempting session refresh before image removal');
          await supabase.auth.refreshSession();
          const refreshCheck = await supabase.auth.getSession();
          if (!refreshCheck.data.session) {
            throw new Error('No active session. User authentication is required.');
          }
        } else {
          throw new Error('No active session. User authentication is required.');
        }
      }
      
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      const urlParts = imageUrl.split('/');
      const storageIndex = urlParts.findIndex(part => part === BUCKET_NAME);
      
      if (storageIndex === -1) {
        console.log('No valid storage path found in URL:', imageUrl);
        onImageChange('');
        return;
      }
      
      const storagePath = urlParts.slice(storageIndex + 1).join('/');
      console.log('Removing image from storage path:', storagePath);
      
      const { error } = await removeFromStorage(storagePath);
      
      if (error) {
        console.error('Error removing image:', error);
        
        const errorMessage = error instanceof StorageError 
          ? error.message 
          : "Failed to remove image";
        
        console.error('Error details:', {
          error,
          message: errorMessage,
          bucket: BUCKET_NAME
        });
        
        throw error;
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
