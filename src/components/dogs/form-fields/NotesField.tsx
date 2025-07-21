
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import { useTranslation } from 'react-i18next';

interface NotesFieldProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const NotesField: React.FC<NotesFieldProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>{t('form.fields.notes.label')}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={t('form.fields.notes.placeholder')}
              className="resize-none"
              {...field}
              disabled={disabled}
            />
          </FormControl>
          <FormDescription>
            {t('form.fields.notes.description')}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
