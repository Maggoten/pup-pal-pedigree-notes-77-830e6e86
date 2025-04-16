
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  const isPlaceholder = !currentImage || currentImage === PLACEHOLDER_IMAGE_PATH;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
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
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      // Construct public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(fileName);
      
      setPreviewImage(publicUrl);
      onImageChange(publicUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Your image has been successfully uploaded"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = async () => {
    if (!previewImage || !user) return;

    try {
      // Extract filename from URL
      const fileName = previewImage.split('/').slice(-2).join('/');
      
      // Delete from Supabase storage
      const { error } = await supabase.storage
        .from('dog-photos')
        .remove([fileName]);
      
      if (error) {
        throw error;
      }
      
      setPreviewImage(null);
      onImageChange('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Image Removed",
        description: "Your image has been successfully removed"
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove image",
        variant: "destructive"
      });
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
