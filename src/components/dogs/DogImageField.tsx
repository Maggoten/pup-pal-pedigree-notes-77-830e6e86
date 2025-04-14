
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ImageUploader';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from './schema/dogFormSchema';

interface DogImageFieldProps {
  form: UseFormReturn<DogFormValues>;
  handleImageChange: (imageBase64: string) => void;
}

const DogImageField: React.FC<DogImageFieldProps> = ({ form, handleImageChange }) => {
  // Determine if the current image is a URL or a base64 string
  const currentImage = form.watch('image') || '';
  
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dog Photo</FormLabel>
          <FormControl>
            <ImageUploader 
              currentImage={currentImage} 
              onImageChange={(imageBase64) => {
                console.log("Image changed in DogImageField");
                field.onChange(imageBase64);
                handleImageChange(imageBase64);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DogImageField;
