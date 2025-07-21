
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ImageUploader';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import { useTranslation } from 'react-i18next';

interface DogImageFieldProps {
  form: UseFormReturn<DogFormValues>;
  handleImageChange: (imageUrl: string) => void;
  disabled?: boolean;
}

const DogImageField: React.FC<DogImageFieldProps> = ({ form, handleImageChange, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('form.fields.photo.label')}</FormLabel>
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
