
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
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        {t('form.sections.registration')}
      </h3>
      <FormField
        control={form.control}
        name="registrationNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.fields.registrationNumber.label')}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t('form.fields.registrationNumber.placeholder')} 
                {...field} 
                disabled={disabled} 
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
