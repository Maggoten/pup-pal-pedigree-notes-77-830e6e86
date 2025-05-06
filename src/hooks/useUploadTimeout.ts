
import { useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { isSafari } from '@/utils/storage/config';

// Increase timeout for Safari 
export const UPLOAD_TIMEOUT = isSafari() ? 45000 : 30000; // 45s for Safari, 30s for others

export const useUploadTimeout = (onTimeout: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTimeout = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onTimeout();
      
      // Customize the message for Safari
      const timeoutMessage = isSafari() 
        ? "The upload took too long in Safari. Try a smaller image or switch to Chrome."
        : "The upload took too long. Please try again with a smaller file.";
      
      toast({
        title: "Upload timeout",
        description: timeoutMessage,
        variant: "destructive"
      });
    }, UPLOAD_TIMEOUT);
  };

  const clearUploadTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return {
    startTimeout,
    clearTimeout: clearUploadTimeout
  };
};
