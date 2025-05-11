
import { useImageUploadState } from './useImageUploadState';
import { useFileUpload } from './useFileUpload';
import { useImageRemoval } from './useImageRemoval';
import { UseImageUploadProps } from './types';
import { useImageSessionCheck } from './useImageSessionCheck';

export const useImageUpload = ({ 
  user_id, 
  onImageChange, 
  onImageSaved 
}: UseImageUploadProps) => {
  // Get session validation
  const { isSessionValid } = useImageSessionCheck();
  
  // Get state management for upload process
  const [
    { isUploading, uploadRetryCount, lastError, isUploadActive },
    { startUpload, completeUpload, setError, resetRetryCount, setIsUploadActive }
  ] = useImageUploadState();

  // Get upload functionality
  const { performUpload } = useFileUpload(user_id, onImageChange, onImageSaved);
  
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
    uploadRetryCount,
    isUploadActive,
    isSessionValid
  };
};
