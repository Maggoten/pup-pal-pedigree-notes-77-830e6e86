
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import ImageUploader from '@/components/ImageUploader';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { useTranslation } from 'react-i18next';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';

interface ExternalSireFieldsProps {
  form: UseFormReturn<PlannedLitterFormValues>;
}

const ExternalSireFields: React.FC<ExternalSireFieldsProps> = ({ form }) => {
  const { t } = useTranslation('plannedLitters');
  const { user } = useAuth();
  
  const handleImageChange = (imageUrl: string) => {
    form.setValue('externalMaleImageUrl', imageUrl);
  };
  
  return (
    <>
      <FormField
        control={form.control}
        name="externalMaleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('forms.plannedLitter.externalSireName')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('placeholders.enterDogName')} className="bg-white border-greige-300" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="externalMaleRegistration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('forms.plannedLitter.registrationNumber')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('placeholders.enterRegistrationNumber')} className="bg-white border-greige-300" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="externalMaleBreed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('forms.plannedLitter.externalSireBreed')}</FormLabel>
            <FormControl>
              <BreedDropdown 
                value={field.value} 
                onChange={field.onChange} 
                className="bg-white border-greige-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="externalMaleImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('forms.plannedLitter.externalSirePhoto')}</FormLabel>
            <FormControl>
              <div className="max-w-[200px] w-full">
                <ImageUploader 
                  currentImage={field.value} 
                  onImageChange={handleImageChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ExternalSireFields;
