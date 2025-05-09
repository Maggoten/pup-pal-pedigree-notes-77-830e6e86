
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
  processImageForUpload
} from '@/utils/storage';
import { validateImageFile } from '@/utils/imageValidation';
import { useImageSessionCheck } from './useImageSessionCheck';
import { UploadResult, hasErrorProperty, safeGetErrorProperty } from './types';

export const useFileUpload = (
  user_id: string | undefined,
  onImageChange: (imageUrl: string) => void
) => {
  const { validateSession } = useImageSessionCheck();

  const performUpload = async (file: File): Promise<boolean> => {
    const platform = getPlatformInfo();
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    
    console.log(`Beginning upload process for file: ${file.name} (${fileSizeMB}MB) on ${platform.device}`, {
      platform,
      fileSize: file.size,
      fileType: file.type || 'unknown'
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
      
      // Set a flag to indicate whether session validation was successful
      let sessionValid = false;
      
      try {
        // Use skipThrow:true for mobile to handle validation errors more gracefully
        sessionValid = await validateSession();
        console.log(`[FileUpload] Session validation ${sessionValid ? 'succeeded' : 'failed'}`);
      } catch (sessionError) {
        console.error('[FileUpload] Session validation error:', sessionError);
        
        // For mobile, try to proceed anyway if validation fails
        if (platform.mobile || platform.safari) {
          console.log('[FileUpload] Mobile detected, attempting upload despite session validation failure');
          // Don't return early, try the upload anyway
        } else {
          // For desktop browsers, be more strict
          throw sessionError;
        }
      }
      
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
      
      // Process the image with enhanced mobile support
      console.log('Processing image before upload...');
      let processedFile;
      try {
        processedFile = await processImageForUpload(file);
        console.log(`Image processed: original size ${file.size} bytes (${fileSizeMB}MB), processed size ${processedFile.size} bytes (${(processedFile.size / 1024 / 1024).toFixed(2)}MB)`);
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
      
      if (!publicUrl) {
        console.error('Failed to get public URL');
        throw new Error('Failed to get public URL for uploaded image');
      }
      
      console.log('Generated public URL:', publicUrl);
      onImageChange(publicUrl);
      
      // Show success toast using setTimeout to ensure it appears after any component state updates
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : getSafeErrorMessage(error);
      
      // Platform-specific error messages
      let friendlyMessage = errorMessage;
      
      if (platform.iOS) {
        friendlyMessage = "iOS upload issue. Try a smaller image (under 2MB) or use a different device.";
      } else if (platform.safari) {
        friendlyMessage = "Safari upload issue. Try a smaller image or use Chrome.";
      } else if (platform.mobile) {
        friendlyMessage = "Mobile upload failed. Try using WiFi or a smaller image file.";
      } else if (typeof errorMessage === 'string' && errorMessage.includes("storage")) {
        friendlyMessage = "Could not upload image. Please try again with a smaller file.";
      }
      
      // Ensure we don't accidentally clear the error message before it's displayed
      setTimeout(() => {
        toast({
          title: "Upload Failed",
          description: friendlyMessage,
          variant: "destructive"
        });
      }, 100);
      
      return false;
    }
  };

  return { performUpload };
};
