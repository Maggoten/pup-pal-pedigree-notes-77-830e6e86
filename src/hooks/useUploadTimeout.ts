
import { useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export const UPLOAD_TIMEOUT = 30000; // 30 seconds

export const useUploadTimeout = (onTimeout: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTimeout = () => {
    timeoutRef.current = setTimeout(() => {
      onTimeout();
      toast({
        title: "Upload timeout",
        description: "The upload took too long. Please try again.",
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
