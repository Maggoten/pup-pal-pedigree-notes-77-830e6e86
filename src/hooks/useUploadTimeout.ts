
import { useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

// Dynamic timeout based on platform
export const getUploadTimeout = () => {
  const platform = getPlatformInfo();
  
  if (platform.ios) {
    return 70000; // 70s for iOS
  } else if (platform.safari) {
    return 60000; // 60s for Safari
  } else if (platform.mobile) {
    return 55000; // 55s for other mobile
  } else {
    return 45000; // 45s for desktop
  }
};

// Export a constant for compatibility
export const UPLOAD_TIMEOUT = getUploadTimeout();

export const useUploadTimeout = (onTimeout: () => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();
  const platform = getPlatformInfo();

  const startTimeout = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const timeout = getUploadTimeout();
    console.log(`Setting upload timeout: ${timeout}ms for ${platform.device}`);
    
    timeoutRef.current = setTimeout(() => {
      onTimeout();
      
      // Platform-specific timeout message
      let timeoutMessage = "The upload took too long.";
      
      if (platform.ios) {
        timeoutMessage = "The upload timed out on iOS. Try a smaller image (under 2MB) or use a different device.";
      } else if (platform.safari) {
        timeoutMessage = "The upload timed out in Safari. Try a smaller image (under 2MB) or switch to Chrome.";
      } else if (platform.mobile) {
        timeoutMessage = "The upload timed out on mobile. Try a smaller image or use WiFi instead of cellular data.";
      } else {
        timeoutMessage = "The upload took too long. Please try again with a smaller file.";
      }
      
      toast({
        title: "Upload timeout",
        description: timeoutMessage,
        variant: "destructive",
        action: {
          label: "Help",
          onClick: () => {
            toast({
              title: "Image Upload Tips",
              description: `For best results on ${platform.device}, try uploading images under 2MB. If using iOS, HEIC images might cause issues - consider converting them to JPEG first.`,
              duration: 8000,
            });
          }
        }
      });
    }, timeout);
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
