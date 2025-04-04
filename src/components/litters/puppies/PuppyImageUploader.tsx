
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PuppyImageUploaderProps {
  puppyName: string;
  currentImage?: string;
  onImageChange: (imageBase64: string) => void;
}

const PuppyImageUploader: React.FC<PuppyImageUploaderProps> = ({ 
  puppyName,
  currentImage,
  onImageChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

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
      onImageChange(base64String);
      setIsUploading(false);
      
      toast({
        title: "Image uploaded",
        description: "Puppy photo has been updated"
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Failed to read the image file",
        variant: "destructive"
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Image removed",
      description: "Puppy photo has been removed"
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-28 w-28">
          {currentImage ? (
            <AvatarImage 
              src={currentImage} 
              alt={puppyName} 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {puppyName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          {currentImage ? 'Change Photo' : 'Upload Photo'}
        </Button>
        
        {currentImage && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleRemoveImage}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
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

export default PuppyImageUploader;
