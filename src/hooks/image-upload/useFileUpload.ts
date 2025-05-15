
import { useState } from 'react';
import { uploadToStorage } from '@/utils/storage';
import { getPublicUrl } from '@/utils/storage';
import { processImageForUpload } from '@/utils/storage/imageUtils';
import { v4 as uuidv4 } from 'uuid';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

/**
 * Custom hook for handling file uploads to storage
 * @param userId - User ID for path segmentation
 * @param onImageChange - Callback when image URL changes
 */
export const useFileUpload = (
  userId: string | undefined,
  onImageChange: (url: string) => void
) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const performUpload = async (file: File): Promise<boolean> => {
    if (!file) {
      console.error('No file provided for upload');
      return false;
    }
    
    try {
      // Process image before upload (resize, compress)
      const processedFile = await processImageForUpload(file);
      if (!processedFile) {
        console.error('Failed to process image file');
        return false;
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const uniqueId = uuidv4();
      
      // Use user-specific path to prevent collisions
      const filePath = userId 
        ? `users/${userId}/${uniqueId}.${fileExt}`
        : `public/${uniqueId}.${fileExt}`;
      
      console.log(`Uploading to path: ${filePath}`);
      
      // Platform-specific logging
      const platform = getPlatformInfo();
      console.log(`Upload initiated from ${platform.device} device`);
      
      // Upload the processed file
      const uploadResult = await uploadToStorage(filePath, processedFile);
      
      if (uploadResult && uploadResult.error) {
        console.error('Error uploading file:', uploadResult.error);
        setUploadError(uploadResult.error.message || 'Upload failed');
        return false;
      }
      
      if (!uploadResult || !uploadResult.data) {
        console.error('Upload completed but no data returned');
        return false;
      }
      
      // Get the public URL for the uploaded file
      const urlResult = getPublicUrl(filePath);
      
      if (urlResult && urlResult.data && urlResult.data.publicUrl) {
        console.log('File uploaded successfully, URL:', urlResult.data.publicUrl);
        onImageChange(urlResult.data.publicUrl);
        setUploadError(null);
        return true;
      } else {
        console.error('Failed to get public URL for uploaded file');
        return false;
      }
    } catch (error) {
      console.error('Error in file upload process:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown upload error');
      return false;
    }
  };
  
  return { 
    performUpload,
    uploadError 
  };
};
