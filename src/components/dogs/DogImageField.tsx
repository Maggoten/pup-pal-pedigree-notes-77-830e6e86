
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ImageUploader';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from './DogFormFields';
import { useUpdateDog } from '@/hooks/dogs/mutations/useUpdateDog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Import this from the utils/storage module rather than from core/bucket directly
import { createBucketIfNotExists } from '@/utils/storage';

interface DogImageFieldProps {
  form: UseFormReturn<DogFormValues>;
  handleImageChange: (imageBase64: string) => void;
  disabled?: boolean;
  dogId?: string;
}

const DogImageField: React.FC<DogImageFieldProps> = ({ form, handleImageChange, disabled, dogId }) => {
  const { user } = useAuth();
  const updateDogMutation = dogId ? useUpdateDog(user?.id) : null;

  // Initialize storage bucket if needed
  React.useEffect(() => {
    const initStorage = async () => {
      if (user?.id) {
        await createBucketIfNotExists();
      }
    };
    
    initStorage();
  }, [user?.id]);

  // Handle image change with auto-save if possible
  const handleImageUpdate = async (imageUrl: string) => {
    try {
      // Update the form state
      handleImageChange(imageUrl);
      
      // If we have a dog ID and mutation, save directly to database
      if (dogId && updateDogMutation) {
        await updateDogMutation.mutateAsync({ 
          id: dogId,
          updates: { image: imageUrl }
        });
        console.log("Dog image updated in database:", imageUrl.substring(0, 50) + "...");
        
        toast({
          title: "Image Updated",
          description: "Dog's profile picture has been updated successfully",
        });
      }
    } catch (error) {
      console.error("Failed to update dog image in database:", error);
      toast({
        title: "Image Update Failed",
        description: "There was a problem saving the image to the database",
        variant: "destructive"
      });
    }
  };

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dog Photo</FormLabel>
          <FormControl>
            <div className="max-w-[200px] w-full">
              <ImageUploader 
                currentImage={field.value} 
                onImageChange={handleImageUpdate}
                className={disabled ? "opacity-70 pointer-events-none" : ""}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DogImageField;
