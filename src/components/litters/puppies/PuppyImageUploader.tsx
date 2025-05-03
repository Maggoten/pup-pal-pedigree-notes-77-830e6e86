
import React, { useState, useCallback, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const [error, setError] = useState<string>('');

  // Update local state when prop changes
  useEffect(() => {
    setImageUrl(currentImage || '');
  }, [currentImage]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create a unique filename with uuid
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `puppies/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('breeding-app-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrl } = supabase.storage
        .from('breeding-app-images')
        .getPublicUrl(filePath);

      if (publicUrl) {
        setImageUrl(publicUrl.publicUrl);
        onImageChange(publicUrl.publicUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange]);

  const handleRemoveImage = useCallback(() => {
    setImageUrl('');
    onImageChange('');
  }, [onImageChange]);

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
      <Avatar className={`${avatarSizeClass} bg-primary/10 text-primary`}>
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={puppyName} />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`absolute ${buttonSizeClass} flex gap-1`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 w-8 rounded-full p-0 shadow-md"
          onClick={() => document.getElementById('puppy-image-upload')?.click()}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4" />
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
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && (
        <p className="text-destructive text-xs mt-1">{error}</p>
      )}

      {isUploading && (
        <p className="text-muted-foreground text-xs mt-1">Uploading...</p>
      )}
    </div>
  );
};

export default PuppyImageUploader;
