
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { useTranslation } from 'react-i18next';

interface NotesFieldProps {
  form: UseFormReturn<PlannedLitterFormValues>;
}

const NotesField: React.FC<NotesFieldProps> = ({ form }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('forms.plannedLitter.notes')}</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder={t('forms.plannedLitter.notesPlaceholder')} className="bg-white border-greige-300" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
