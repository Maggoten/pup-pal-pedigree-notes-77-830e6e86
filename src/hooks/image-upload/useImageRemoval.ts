
import { useState } from 'react';

type RemoveImageCallback = (url: string) => void;

/**
 * Hook to handle image removal functionality
 */
export const useImageRemoval = (onImageChange: RemoveImageCallback) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const removeImage = async () => {
    try {
      setIsRemoving(true);
      setRemoveError(null);
      
      // Call the callback to clear the URL
      onImageChange('');
      
    } catch (error) {
      console.error("Error removing image:", error);
      setRemoveError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRemoving(false);
    }
  };

  return { 
    isRemoving, 
    removeImage, 
    removeError 
  };
};
