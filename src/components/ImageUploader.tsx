
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/image-upload';
import ImagePreviewDisplay from './image-upload/ImagePreviewDisplay';
import { toast } from '@/components/ui/use-toast';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { uploadStateManager } from '@/components/AuthGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage,
  onImageChange,
  className = ''
}) => {
  const { user, isAuthReady } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [visibleError, setVisibleError] = useState<string | null>(null);
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !currentImage || currentImage === PLACEHOLDER_IMAGE_PATH;
  const platform = getPlatformInfo();

  // Pass the current user ID to useImageUpload
  const { isUploading, uploadImage, removeImage, lastError, uploadRetryCount } = useImageUpload({
    user_id: user?.id,
    onImageChange: (url: string) => {
      console.log('ImageUploader: Image change callback received URL:', 
                 url.substring(0, 50) + (url.length > 50 ? '...' : ''));
      onImageChange(url);
    }
  });

  // Show errors in the UI
  useEffect(() => {
    if (lastError) {
      setVisibleError(lastError);
      console.error('Image upload error:', lastError);
    } else {
      setVisibleError(null);
    }
  }, [lastError]);

  // Track upload state in the global manager
  useEffect(() => {
    if (isUploading) {
      uploadStateManager.incrementUploads();
    } else {
      uploadStateManager.decrementUploads();
    }
    
    return () => {
      // Make sure we decrement if component unmounts during upload
      if (isUploading) {
        uploadStateManager.decrementUploads();
      }
    };
  }, [isUploading]);

  // Log user authentication status when component mounts
  useEffect(() => {
    console.log('ImageUploader: User authentication status:', {
      isAuthenticated: !!user,
      userId: user?.id,
      authReady: isAuthReady,
      currentImage: currentImage ? (currentImage.length > 50 ? currentImage.substring(0, 50) + '...' : currentImage) : 'none',
      platform: platform.device
    });
    
    // Set initial render flag to false after first render
    setIsInitialRender(false);
  }, [user, currentImage, isAuthReady]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!user) {
      console.error('Upload attempt without authentication');
      toast({
        title: "Authentication Required",
        description: "Please log in to upload images",
        variant: "destructive"
      });
      return;
    }
    
    console.log('ImageUploader: File selected:', {
      name: file.name, 
      size: `${(file.size / 1024).toFixed(1)}KB`, 
      type: file.type || 'unknown',
      platform: platform.device
    });
    
    try {
      console.log('ImageUploader: Calling uploadImage function...');
      setVisibleError(null); // Clear any previous errors
      // Set a flag to prevent auth redirect during upload
      await uploadImage(file);
      console.log('ImageUploader: Upload function completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('ImageUploader: Image upload error caught:', errorMessage);
      setVisibleError(errorMessage);
      
      // Show more specific error messages based on platform
      if (platform.ios) {
        toast({
          title: "iOS Upload Issue",
          description: "There was a problem uploading your image. Try using a smaller image or a different device.",
          variant: "destructive"
        });
      } else if (platform.safari) {
        toast({
          title: "Safari Upload Issue",
          description: "There was a problem uploading your image. Try using a smaller image or switch to Chrome.",
          variant: "destructive"
        });
      } else if (platform.mobile) {
        toast({
          title: "Mobile Upload Issue",
          description: "There was a problem uploading your image. Try using WiFi or a smaller image file.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload Failed",
          description: errorMessage || "There was a problem uploading your image. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (!isAuthReady) {
      console.log('Auth not ready, delaying upload');
      toast({
        title: "Please Wait",
        description: "Authentication is being initialized. Please try again in a moment.",
        variant: "default"
      });
      return;
    }
    
    if (!user) {
      console.log('User not logged in, cannot upload');
      toast({
        title: "Authentication Required",
        description: "Please log in to upload images",
        variant: "destructive"
      });
      return;
    }
    console.log('ImageUploader: Upload button clicked, opening file picker');
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = async () => {
    // Only proceed if there's a valid image to remove
    if (!currentImage || !user || isPlaceholder) {
      console.log('Cannot remove image: missing image URL or user ID', {
        currentImage: currentImage ? (currentImage.length > 50 ? currentImage.substring(0, 50) + '...' : currentImage) : 'none',
        userId: user?.id || 'not logged in',
        isPlaceholder
      });
      return;
    }
    
    console.log('ImageUploader: Removing image:', 
                currentImage.substring(0, 50) + (currentImage.length > 50 ? '...' : ''));
    try {
      setVisibleError(null); // Clear any previous errors
      await removeImage(currentImage, user.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('ImageUploader: Image remove error:', errorMessage);
      setVisibleError(errorMessage);
      toast({
        title: "Remove Failed",
        description: "Failed to remove image. Please try again.",
        variant: "destructive"
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <ImagePreviewDisplay imageUrl={currentImage} />
      
      {visibleError && (
        <Alert variant="destructive" className="mt-2 mb-2 py-2 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            {visibleError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-2 flex gap-2">
        <Button 
          type="button" 
          onClick={handleUploadClick} 
          className="flex-1"
          variant="outline"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              {currentImage && !isPlaceholder ? 'Change' : 'Upload'}
            </>
          )}
        </Button>
        
        {currentImage && !isPlaceholder && (
          <Button 
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            size="icon"
            disabled={isUploading}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {uploadRetryCount > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Retrying upload... ({uploadRetryCount})
        </p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
