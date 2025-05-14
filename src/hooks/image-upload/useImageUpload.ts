
import { useImageUploadState } from './useImageUploadState';
import { useFileUpload } from './useFileUpload';
import { useImageRemoval } from './useImageRemoval';
import { UseImageUploadProps } from './types';

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
      startUpload();
      const success = await performUpload(file);
      
      if (success) {
        resetRetryCount();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
