
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImagePreviewDisplay from './image-upload/ImagePreviewDisplay';
import { toast } from '@/hooks/use-toast';

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
      currentImage: currentImage || 'none'
    });
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
    
    console.log('File selected:', file.name, 'size:', file.size, 'type:', file.type);
    await uploadImage(file);
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
    await removeImage(currentImage, user.id);
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
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
