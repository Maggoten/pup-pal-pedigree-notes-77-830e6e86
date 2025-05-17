
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/providers/AuthProvider';
import ImagePreviewDisplay from '@/components/image-upload/ImagePreviewDisplay';

interface PuppyImageUploaderProps {
  puppyName: string;
  currentImage?: string;
  onImageChange: (url: string) => void;
  large?: boolean;
}

const PuppyImageUploader: React.FC<PuppyImageUploaderProps> = ({
  puppyName,
  currentImage,
  onImageChange,
  large = false
}) => {
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update local state when prop changes
  useEffect(() => {
    setImageUrl(currentImage || '');
  }, [currentImage]);

  // Use the same image upload hook as the dog upload functionality
  const { isUploading, uploadImage, removeImage, lastError } = useImageUpload({
    user_id: user?.id,
    onImageChange: (url: string) => {
      setImageUrl(url);
      onImageChange(url);
    }
  });

  const handleUploadClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload images",
        variant: "destructive"
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await uploadImage(file);
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was a problem uploading the image",
        variant: "destructive"
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl || !user) return;
    
    try {
      await removeImage(imageUrl, user.id);
      setImageUrl('');
      onImageChange('');
      toast({
        title: "Success",
        description: "Image removed successfully"
      });
    } catch (error) {
      toast({
        title: "Remove Failed",
        description: "Failed to remove image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const initials = puppyName
    ? puppyName.substring(0, 2).toUpperCase()
    : 'PU';

  const avatarSizeClass = large 
    ? "w-40 h-40 text-3xl"
    : "w-16 h-16 text-sm";
    
  const buttonSizeClass = large
    ? "bottom-2 right-2"
    : "bottom-0 right-0";

  return (
    <div className={`relative ${large ? 'mx-auto' : ''}`}>
      <div className={`${large ? 'w-40 h-40' : 'w-16 h-16'}`}>
        {imageUrl ? (
          <ImagePreviewDisplay imageUrl={imageUrl} />
        ) : (
          <Avatar className={`${avatarSizeClass} bg-primary/10 text-primary`}>
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={`absolute ${buttonSizeClass} flex gap-1`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 w-8 rounded-full p-0 shadow-md"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
              <path d="M12 12v9"></path>
              <path d="m16 16-4-4-4 4"></path>
            </svg>
          )}
          <span className="sr-only">Upload image</span>
        </Button>

        {imageUrl && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 w-8 rounded-full p-0 shadow-md"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        )}
      </div>

      <input
        type="file"
        id="puppy-image-upload"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {lastError && (
        <p className="text-destructive text-xs mt-1">{lastError}</p>
      )}
    </div>
  );
};

export default PuppyImageUploader;
