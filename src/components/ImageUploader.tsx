
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageBase64: string) => void;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage,
  onImageChange,
  className = ''
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !currentImage || currentImage === PLACEHOLDER_IMAGE_PATH;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPreviewImage(base64String);
      onImageChange(base64String);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive"
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="relative aspect-square w-full overflow-hidden rounded-lg border border-border"
      >
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Dog preview" 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>
      
      <div className="mt-2 flex gap-2">
        <Button 
          type="button" 
          onClick={handleUploadClick} 
          className="flex-1"
          variant="outline"
          disabled={isUploading}
        >
          <UploadIcon className="mr-2 h-4 w-4" />
          {previewImage && !isPlaceholder ? 'Change' : 'Upload'}
        </Button>
        
        {previewImage && !isPlaceholder && (
          <Button 
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            size="icon"
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
