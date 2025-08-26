
import React from 'react';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ImageUploader';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from './DogFormFields';

interface DogImageFieldProps {
  form: UseFormReturn<DogFormValues>;
  handleImageChange: (imageBase64: string) => void;
  disabled?: boolean;
}

const DogImageField: React.FC<DogImageFieldProps> = ({ form, handleImageChange, disabled }) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="max-w-[200px] w-full">
              <ImageUploader 
                currentImage={field.value} 
                onImageChange={handleImageChange}
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
