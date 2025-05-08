
import { useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { isSafari } from '@/utils/storage/config';

// Increase timeout for Safari 
export const UPLOAD_TIMEOUT = isSafari() ? 60000 : 45000; // 60s for Safari, 45s for others

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
        ? "The upload took too long in Safari. Try a smaller image (under 2MB) or switch to Chrome."
        : "The upload took too long. Please try again with a smaller file.";
      
      toast({
        title: "Upload timeout",
        description: timeoutMessage,
        variant: "destructive",
        action: {
          label: "Help",
          onClick: () => {
            toast({
              title: "Image Upload Tips",
              description: "For best results, try uploading images under 2MB. HEIC images from iPhones might cause issues - consider converting them to JPEG first.",
              duration: 8000,
            });
          }
        }
      });
    }, UPLOAD_TIMEOUT);
  };

  const clearUploadTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  return {
    startTimeout,
    clearTimeout: clearUploadTimeout
  };
};
