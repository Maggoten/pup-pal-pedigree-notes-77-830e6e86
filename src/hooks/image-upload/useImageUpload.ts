
import { useImageUploadState } from './useImageUploadState';
import { useFileUpload } from './useFileUpload';
import { useImageRemoval } from './useImageRemoval';
import { UseImageUploadProps } from './types';
import { toast } from '@/components/ui/use-toast';
import { BUCKET_NAME } from '@/utils/storage/config';

export const useImageUpload = ({ user_id, onImageChange }: UseImageUploadProps) => {
  // Get state management for upload process
  const [
    { isUploading, uploadRetryCount, lastError },
    { startUpload, completeUpload, setError, resetRetryCount }
  ] = useImageUploadState();

  // Get upload functionality
  const { performUpload } = useFileUpload(user_id, onImageChange);
  
  // Get image removal functionality
  const { removeImage } = useImageRemoval(onImageChange);

  // Main upload function
  const uploadImage = async (file: File) => {
    try {
      console.log(`Starting image upload to bucket: ${BUCKET_NAME}`);
      
      if (!user_id) {
        console.error('Upload failed: No user ID provided');
        toast({
          title: "Authentication Required",
          description: "Please log in to upload images",
          variant: "destructive"
        });
        return;
      }
      
      startUpload();
      const success = await performUpload(file);
      
      if (success) {
        resetRetryCount();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Image upload error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      completeUpload();
    }
  };

  return {
    isUploading,
    uploadImage,
    removeImage,
    lastError,
    uploadRetryCount
  };
};
