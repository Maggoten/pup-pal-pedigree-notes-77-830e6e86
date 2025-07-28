
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { useTranslation } from 'react-i18next';

interface ExternalSireFieldsProps {
  form: UseFormReturn<PlannedLitterFormValues>;
}

const ExternalSireFields: React.FC<ExternalSireFieldsProps> = ({ form }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <>
      <FormField
        control={form.control}
        name="externalMaleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('forms.plannedLitter.externalSireName')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter dog name" className="bg-white border-greige-300" />
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
              <Input {...field} placeholder="Enter registration number" className="bg-white border-greige-300" />
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
    </>
  );
};

export default ExternalSireFields;
