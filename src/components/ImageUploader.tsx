import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/image-upload';
import ImagePreviewDisplay from './image-upload/ImagePreviewDisplay';
import { toast } from '@/components/ui/use-toast';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

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
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !currentImage || currentImage === PLACEHOLDER_IMAGE_PATH;
  const platform = getPlatformInfo();

  // Pass the current user ID to useImageUpload
  const { isUploading, uploadImage, removeImage } = useImageUpload({
    user_id: user?.id,
    onImageChange
  });

  // Log user authentication status when component mounts
  useEffect(() => {
    console.log('ImageUploader: User authentication status:', {
      isAuthenticated: !!user,
      userId: user?.id,
      currentImage: currentImage || 'none',
      platform: platform.device
    });
    
    // Set initial render flag to false after first render
    setIsInitialRender(false);
  }, [user, currentImage]);

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
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
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
        currentImage: currentImage || 'none',
        userId: user?.id || 'not logged in',
        isPlaceholder
      });
      return;
    }
    
    console.log('ImageUploader: Removing image:', currentImage);
    try {
      await removeImage(currentImage, user.id);
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

  // Remove mobile help warning completely by returning null
  const renderMobileHelp = () => {
    return null;
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
      
      {renderMobileHelp()}
      
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
