
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
  removeFromStorage
} from '@/utils/storage';
import { processImageForUpload } from '@/utils/storage/imageUtils';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { useUploadTimeout } from '@/hooks/useUploadTimeout';

interface UseImageUploadProps {
  user_id: string | undefined;
  onImageChange: (imageUrl: string) => void;
}

export const useImageUpload = ({ user_id, onImageChange }: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { startTimeout, clearTimeout } = useUploadTimeout(() => setIsUploading(false));
  const [uploadRetryCount, setUploadRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    const platform = getPlatformInfo();
    
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
    setLastError(null);
    console.log(`Starting image upload to bucket: '${BUCKET_NAME}'`, {
      platform: platform.device,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type || 'unknown'
    });
    
    try {
      // First check session and refresh if needed
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!sessionData.session) {
        // Try to refresh session
        console.log('No active session, attempting to refresh');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh error:', refreshError);
          throw new Error('Session refresh failed: ' + refreshError.message);
        }
        
        if (!refreshData.session) {
          if (platform.safari || platform.mobile) {
            // Special handling for mobile browsers which have more session issues
            console.log(`${platform.device} detected, making extra refresh attempt`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const secondRefresh = await supabase.auth.refreshSession();
            if (!secondRefresh.data.session) {
              throw new Error('No active session after multiple refresh attempts. Please login again.');
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
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      let fileName = `${user_id}/${Date.now()}.${fileExt}`;
      
      // Add platform info to filename for troubleshooting
      if (platform.mobile) {
        fileName = `${user_id}/${Date.now()}_${platform.iOS ? 'ios' : 'mobile'}.${fileExt}`;
      } else if (platform.safari) {
        fileName = `${user_id}/${Date.now()}_safari.${fileExt}`;
      }
      
      // Start timeout monitor
      startTimeout();
      
      // Process the image with enhanced mobile support
      console.log('Processing image before upload...');
      let processedFile;
      try {
        processedFile = await processImageForUpload(file);
        console.log(`Image processed: original size ${file.size} bytes, processed size ${processedFile.size} bytes`);
      } catch (processError) {
        console.error('Image processing failed, using original file:', processError);
        processedFile = file;
      }

      // Upload with enhanced logging
      const uploadResult = await uploadToStorage(fileName, processedFile);
      
      // Clear the upload timeout
      clearTimeout();
      
      // Handle upload result
      if (uploadResult.error) {
        const errorMessage = uploadResult.error instanceof StorageError 
          ? uploadResult.error.message 
          : "Could not upload the image";
        
        console.error('Upload error:', {
          error: uploadResult.error,
          message: errorMessage,
          bucket: BUCKET_NAME,
          fileName,
          fileSize: `${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
          platform: platform.device
        });

        throw new Error(errorMessage);
      }
      
      console.log('Upload successful, getting public URL');
      
      // Get the public URL with cache busting
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
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      
      // Platform-specific error messages
      let friendlyMessage = errorMessage;
      
      if (platform.iOS) {
        friendlyMessage = "iOS upload issue. Try a smaller image (under 2MB) or use a different device.";
      } else if (platform.safari) {
        friendlyMessage = "Safari upload issue. Try a smaller image or use Chrome.";
      } else if (platform.mobile) {
        friendlyMessage = "Mobile upload failed. Try using WiFi or a smaller image file.";
      } else if (errorMessage.includes("storage")) {
        friendlyMessage = "Could not upload image. Please try again with a smaller file.";
      }
      
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
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
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
      const { error } = await removeFromStorage(storagePath);
      
      if (error) {
        console.error('Error removing image:', error);
        throw error;
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

  return {
    isUploading,
    uploadImage,
    removeImage,
    lastError
  };
};
