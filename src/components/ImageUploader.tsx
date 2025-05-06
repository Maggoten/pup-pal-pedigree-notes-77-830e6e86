
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImagePreviewDisplay from './image-upload/ImagePreviewDisplay';
import { toast } from '@/components/ui/use-toast';
import { isSafari } from '@/utils/storage/config';

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
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !currentImage || currentImage === PLACEHOLDER_IMAGE_PATH;
  const isSafariBrowser = isSafari();

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
      browser: isSafariBrowser ? 'Safari' : 'Other'
    });
  }, [user, currentImage, isSafariBrowser]);

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
    
    console.log('File selected:', file.name, 'size:', file.size, 'type:', file.type, 'browser:', isSafariBrowser ? 'Safari' : 'Other');
    
    try {
      await uploadImage(file);
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
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
    
    console.log('Removing image:', currentImage);
    try {
      await removeImage(currentImage, user.id);
    } catch (error) {
      console.error('Image remove error:', error);
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

  // Show Safari-specific guidance if needed
  const renderSafariHelp = () => {
    if (!isSafariBrowser) return null;
    
    return (
      <div className="mt-1 flex items-center text-xs text-amber-600">
        <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
        <span>For best results, use smaller images (under 2MB)</span>
      </div>
    );
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
          <UploadIcon className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : (currentImage && !isPlaceholder ? 'Change' : 'Upload')}
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
      
      {renderSafariHelp()}
      
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
