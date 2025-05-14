
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/image-upload';
import ImagePreviewDisplay from './image-upload/ImagePreviewDisplay';
import { toast } from '@/components/ui/use-toast';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';
import { uploadStateManager, setUploadPending } from '@/components/AuthGuard';
import { createBucketIfNotExists } from '@/utils/storage/core/bucket';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  onImageSaved?: (imageUrl: string) => Promise<void>;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage,
  onImageChange,
  onImageSaved,
  className = ''
}) => {
  const { user, isAuthReady } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !currentImage || currentImage === PLACEHOLDER_IMAGE_PATH;
  const platform = getPlatformInfo();

  // Initialize bucket if user is authenticated
  useEffect(() => {
    if (user?.id && isAuthReady) {
      createBucketIfNotExists().catch(err => {
        console.error("Failed to initialize storage bucket:", err);
      });
    }
  }, [user?.id, isAuthReady]);

  // Pass the current user ID to useImageUpload
  const { isUploading, uploadImage, removeImage, isUploadActive } = useImageUpload({
    user_id: user?.id,
    onImageChange: (url: string) => {
      console.log('ImageUploader: Image change callback received URL:', 
                 url.substring(0, 50) + (url.length > 50 ? '...' : ''));
      onImageChange(url);
    },
    onImageSaved // Pass through the auto-save callback
  });

  // Track upload state in the global manager and AuthGuard
  useEffect(() => {
    if (isUploading) {
      uploadStateManager.incrementUploads();
      setUploadPending(true);
    } else {
      // Add a short delay before marking upload as complete
      setTimeout(() => {
        uploadStateManager.decrementUploads();
        if (!isUploadActive) {
          setUploadPending(false);
        }
      }, 1000);
    }
    
    return () => {
      // Make sure we decrement if component unmounts during upload
      if (isUploading) {
        uploadStateManager.decrementUploads();
        setUploadPending(false);
      }
    };
  }, [isUploading, isUploadActive]);

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
      // Notify AuthGuard that we're starting an upload
      setUploadPending(true);
      await uploadImage(file);
      console.log('ImageUploader: Upload function completed');
    } catch (error) {
      console.error('ImageUploader: Image upload error:', error);
      
      // Show more specific error messages based on platform
      if (platform.iOS) {
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
          description: "There was a problem uploading your image. Please try again.",
          variant: "destructive"
        });
      }
      
      // Release upload pending state
      setUploadPending(false);
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
      // Update the removeImage call to match its signature (it doesn't need user.id)
      await removeImage();
      
      // If we have an onImageSaved callback, call it with empty string to clear the image
      if (onImageSaved) {
        try {
          await onImageSaved('');
          console.log("Image removed from database");
          toast({
            title: "Image Removed",
            description: "The image has been successfully removed"
          });
        } catch (error) {
          console.error("Failed to remove image from database:", error);
          toast({
            title: "Remove Error",
            description: "Failed to update database after removing image",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('ImageUploader: Image remove error:', error);
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
