
import { toast } from '@/components/ui/use-toast';
import { 
  BUCKET_NAME, 
  getSafeErrorMessage
} from '@/utils/storage/config';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { 
  checkBucketExists, 
  uploadToStorage, 
  getPublicUrl,
  processImageForUpload,
  isValidPublicUrl
} from '@/utils/storage';
import { validateImageFile } from '@/utils/imageValidation';
import { useImageSessionCheck } from './useImageSessionCheck';
import { UploadResult, hasErrorProperty, safeGetErrorProperty } from './types';
import { useAuth } from '@/context/AuthContext';

export const useFileUpload = (
  user_id: string | undefined,
  onImageChange: (imageUrl: string) => void
) => {
  const { validateSession } = useImageSessionCheck();
  const { isAuthReady } = useAuth();

  const performUpload = async (file: File): Promise<boolean> => {
    const platform = getPlatformInfo();
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    
    console.log(`Beginning upload process for file: ${file.name} (${fileSizeMB}MB) on ${platform.device}`, {
      platform,
      fileSize: file.size,
      fileType: file.type || 'unknown',
      authReady: isAuthReady
    });
    
    if (!user_id) {
      console.error('Upload failed: No user ID provided');
      toast({
        title: "Authentication Error",
        description: "Please login again to upload images",
        variant: "destructive"
      });
      return false;
    }
    
    // First validate the file - if it fails validation, stop here
    console.log('Running file validation checks...');
    if (!validateImageFile(file)) {
      console.log('File validation failed, aborting upload');
      return false;
    }
    
    try {
      // Validate and refresh session if needed - with enhanced mobile handling
      console.log(`[FileUpload] Validating session before upload on ${platform.device}`);
      
      // Attempt session validation but don't block mobile uploads if it fails
      let sessionValid = false;
      
      try {
        sessionValid = await validateSession();
        console.log(`[FileUpload] Session validation ${sessionValid ? 'succeeded' : 'failed'}`);
      } catch (sessionError) {
        console.error('[FileUpload] Session validation error:', sessionError);
        
        // For mobile, always try to proceed anyway if validation fails
        if (platform.mobile || platform.safari) {
          console.log('[FileUpload] Mobile detected, attempting upload despite session validation failure');
          sessionValid = true; // Force continue on mobile
        } else {
          throw new Error('Session validation failed. Please try logging in again.');
        }
      }
      
      // Verify bucket exists before proceeding
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        throw new Error(`Storage bucket "${BUCKET_NAME}" does not exist or is not accessible`);
      }
      
      // Create a unique filename with better platform identification
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      let fileName = '';
      
      // More specific platform identification in filename
      if (platform.ios && platform.safari) {
        fileName = `${user_id}/${timestamp}_ios_safari.${fileExt}`;
      } else if (platform.ios) {
        fileName = `${user_id}/${timestamp}_ios.${fileExt}`;
      } else if (platform.safari) {
        fileName = `${user_id}/${timestamp}_safari.${fileExt}`;
      } else if (platform.mobile) {
        fileName = `${user_id}/${timestamp}_mobile.${fileExt}`;
      } else {
        fileName = `${user_id}/${timestamp}.${fileExt}`;
      }
      
      // Process the image with enhanced mobile support
      console.log('Processing image before upload...');
      let processedFile;
      try {
        // For very small files on mobile devices, skip processing entirely
        if (platform.mobile && file.size < 2.5 * 1024 * 1024) {
          console.log('Small file on mobile device, skipping image processing');
          processedFile = file;
        } else {
          processedFile = await processImageForUpload(file);
          console.log(`Image processed: original size ${file.size} bytes (${fileSizeMB}MB), processed size ${processedFile.size} bytes (${(processedFile.size / 1024 / 1024).toFixed(2)}MB)`);
        }
      } catch (processError) {
        console.error('Image processing failed, using original file:', processError);
        processedFile = file;
        console.log('Using original unprocessed file for upload');
      }

      // Upload with enhanced logging
      console.log(`Starting upload of file ${fileName} to storage...`);
      const uploadResult = await uploadToStorage(fileName, processedFile) as UploadResult;
      
      // Properly check properties with type safety
      const hasError = hasErrorProperty(uploadResult);
      const errorMessage = hasError ? getSafeErrorMessage(uploadResult.error) : 'none';
      const hasData = uploadResult && typeof uploadResult === 'object' && 'data' in uploadResult;
      const statusCode = hasError ? safeGetErrorProperty(uploadResult.error, 'statusCode', null) : null;
      
      console.log('Upload result received:', {
        error: errorMessage,
        data: hasData ? 'success' : 'no data',
        statusCode: statusCode
      });
      
      // Handle upload result
      if (hasErrorProperty(uploadResult) && uploadResult.error) {
        const errorMessage = getSafeErrorMessage(uploadResult.error);
        
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
      
      // Validate the public URL is legitimate before proceeding
      if (!publicUrl || !isValidPublicUrl(publicUrl)) {
        console.error('Failed to get valid public URL:', publicUrl);
        throw new Error('Failed to get valid public URL for uploaded image');
      }
      
      console.log('Successfully generated public URL:', publicUrl.substring(0, 100) + '...');
      
      // Show upload success toast immediately
      toast({
        title: "Upload Success",
        description: "Image uploaded successfully to storage"
      });
      
      // Update the image in UI with the new URL
      onImageChange(publicUrl);
      
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : getSafeErrorMessage(error);
      
      // Platform-specific error messages
      let friendlyMessage = errorMessage;
      
      if (platform.ios) {
        friendlyMessage = "iOS upload issue. Try using WiFi instead of cellular data, or try again later.";
      } else if (platform.safari) {
        friendlyMessage = "Safari upload issue. Try reloading the page and trying again, or use Chrome.";
      } else if (platform.mobile) {
        friendlyMessage = "Mobile upload failed. Try using WiFi or reloading the page.";
      } else if (typeof errorMessage === 'string' && errorMessage.includes("storage")) {
        friendlyMessage = "Could not upload image. Please try logging out and back in, then try again.";
      }
      
      toast({
        title: "Upload Failed",
        description: friendlyMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  return { performUpload };
};
