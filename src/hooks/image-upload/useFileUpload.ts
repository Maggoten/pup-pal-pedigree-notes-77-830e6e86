
import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { compressImage } from '@/utils/storage/imageUtils';
import { toast } from '@/hooks/use-toast';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { STORAGE_ERRORS } from '@/utils/storage/config';
import { UploadResult } from './types';

// Import this function from the main storage module
import { uploadFileAndGetUrl } from '@/utils/storage';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Hook to handle file upload functionality
 */
export const useFileUpload = (
  user_id: string | null | undefined,
  onImageChange: (url: string) => void,
  onImageSaved?: (url: string) => Promise<void>
) => {
  const { isAuthReady } = useAuth();
  const uploadInProgressRef = useRef(false);
  
  /**
   * Process and upload a file to storage
   */
  const performUpload = async (file: File): Promise<boolean> => {
    // Prevent multiple concurrent uploads
    if (uploadInProgressRef.current) {
      console.warn('Upload already in progress');
      return false;
    }
    
    try {
      uploadInProgressRef.current = true;
      
      // Check if user is authenticated
      if (!isAuthReady || !user_id) {
        throw new Error('User is not authenticated');
      }
      
      // Basic file validation
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image size exceeds the 5MB limit');
      }
      
      // Compress the image for better upload/display performance
      const compressedFile = await compressImage(file);
      
      // Log platform info for debugging
      const platform = getPlatformInfo();
      console.log(`[useFileUpload] Uploading from: ${platform.device}, Browser: ${platform.userAgent}`);
      
      // Upload file to storage and get public URL
      const publicUrl = await uploadFileAndGetUrl(compressedFile, user_id);
      
      if (!publicUrl) {
        throw new Error(STORAGE_ERRORS.UPLOAD_FAILED);
      }
      
      // Update the UI with the new image
      onImageChange(publicUrl);
      
      // If a save callback is provided, save the image URL to the database
      if (onImageSaved) {
        try {
          await onImageSaved(publicUrl);
          toast({
            title: 'Image saved successfully',
            description: 'Your changes have been saved to the database',
          });
        } catch (saveError) {
          console.error('Error saving image to database:', saveError);
          toast({
            title: 'Image displayed but not saved',
            description: 'There was a problem saving to database. Try saving the form.',
            variant: 'destructive',
          });
          // Return true anyway since the image upload itself was successful
          return true;
        }
      }
      
      return true;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Image upload error:', errorMessage);
      
      toast({
        title: 'Upload failed',
        description: errorMessage || 'There was a problem uploading your image',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      uploadInProgressRef.current = false;
    }
  };
  
  return { performUpload };
};
