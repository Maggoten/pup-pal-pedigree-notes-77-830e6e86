
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import ImageUploader from '@/components/ImageUploader';
import ImagePreview from './ImagePreview';
import ImageUploadButtons from './ImageUploadButtons';

interface DogImageFieldProps {
  form: UseFormReturn<DogFormValues>;
  handleImageChange: (imageBase64: string) => void;
}

const DogImageField: React.FC<DogImageFieldProps> = ({ form, handleImageChange }) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dog Photo</FormLabel>
          <FormControl>
            <ImageUploader 
              currentImage={field.value} 
              onImageChange={handleImageChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DogImageField;
