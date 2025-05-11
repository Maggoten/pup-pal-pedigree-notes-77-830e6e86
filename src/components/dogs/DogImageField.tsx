
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ImageUploader';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from './DogFormFields';
import { useUpdateDog } from '@/hooks/dogs/mutations/useUpdateDog';
import { useAuth } from '@/hooks/useAuth';

interface DogImageFieldProps {
  form: UseFormReturn<DogFormValues>;
  handleImageChange: (imageBase64: string) => void;
  disabled?: boolean;
  dogId?: string;
}

const DogImageField: React.FC<DogImageFieldProps> = ({ form, handleImageChange, disabled, dogId }) => {
  const { user } = useAuth();
  const updateDogMutation = dogId ? useUpdateDog(user?.id) : null;

  // Handle image change with auto-save if possible
  const handleImageUpdate = async (imageUrl: string) => {
    // Update the form state
    handleImageChange(imageUrl);
    
    // If we have a dog ID and mutation, save directly to database
    if (dogId && updateDogMutation) {
      try {
        await updateDogMutation.mutateAsync({ 
          id: dogId,
          updates: { image: imageUrl }
        });
        console.log("Dog image updated in database:", imageUrl.substring(0, 50) + "...");
      } catch (error) {
        console.error("Failed to update dog image in database:", error);
      }
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
