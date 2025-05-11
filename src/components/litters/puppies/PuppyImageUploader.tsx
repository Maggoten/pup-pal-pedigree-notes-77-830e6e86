
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash } from 'lucide-react';
import { useImageUpload } from '@/hooks/image-upload';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Puppy } from '@/types/puppies';

export interface PuppyImageUploaderProps {
  puppyId: string;
  litterId: string;
  puppyName: string;
  currentImage?: string;
  onImageChange: (newImageUrl: string) => void;
  large?: boolean;
}

const PuppyImageUploader: React.FC<PuppyImageUploaderProps> = ({
  puppyId,
  litterId,
  puppyName,
  currentImage,
  onImageChange,
  large = false
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Save the image URL to the database after upload
  const saveImageToDatabase = async (url: string) => {
    if (!puppyId || !user?.id) return;
    
    try {
      // Update the puppy record with the new image URL
      const response = await fetch(`/api/puppies/${puppyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: url,
          updated_by: user.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update puppy image');
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['puppies', litterId] });
      
      return;
    } catch (error) {
      console.error('Failed to save puppy image:', error);
      throw error;
    }
  };
  
  const { uploadImage, removeImage, isUploading } = useImageUpload({
    user_id: user?.id,
    onImageChange,
    onImageSaved: saveImageToDatabase
  });
  
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      await uploadImage(file);
      toast({
        title: 'Image uploaded',
        description: `Picture for ${puppyName} was successfully uploaded.`
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was a problem uploading the image.',
        variant: 'destructive'
      });
    }
  };
  
  const handleRemoveImage = async () => {
    if (!currentImage) return;
    
    try {
      await removeImage(currentImage);
      await saveImageToDatabase(''); // Clear the image URL in the database
      toast({
        title: 'Image removed',
        description: `Picture for ${puppyName} was successfully removed.`
      });
    } catch (error) {
      toast({
        title: 'Failed to remove image',
        description: 'There was a problem removing the image.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className={`relative ${large ? 'w-full' : 'w-24'} flex flex-col gap-2`}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
      />
      
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt={`${puppyName} photo`}
            className={`rounded-lg object-cover ${large ? 'w-full h-64' : 'w-24 h-24'}`}
          />
          
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleRemoveImage}
          >
            <Trash size={14} />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className={`border-dashed border-2 ${large ? 'h-64 w-full' : 'h-24 w-24'} flex flex-col justify-center items-center gap-2`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload size={24} />
          <span className="text-xs">{isUploading ? 'Uploading...' : 'Add Photo'}</span>
        </Button>
      )}
    </div>
  );
};

export default PuppyImageUploader;
