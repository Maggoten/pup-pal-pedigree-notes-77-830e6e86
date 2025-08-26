
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import { useTranslation } from 'react-i18next';

interface RegistrationFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const RegistrationFields: React.FC<RegistrationFieldsProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="registeredName"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t('form.fields.registeredName.label')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('form.fields.registeredName.placeholder')} 
                {...field} 
                disabled={disabled} 
                className="h-10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="registrationNumber"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t('form.fields.registrationNumber.label')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('form.fields.registrationNumber.placeholder')} 
                {...field} 
                disabled={disabled} 
                className="h-10"
              />
            </FormControl>
            <FormDescription className="text-xs">
              {t('form.fields.registrationNumber.description')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RegistrationFields;
