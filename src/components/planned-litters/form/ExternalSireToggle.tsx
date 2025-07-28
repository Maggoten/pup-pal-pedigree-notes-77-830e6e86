
import React from 'react';
import { FormField, FormItem, FormLabel, FormDescription, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { useTranslation } from 'react-i18next';

interface ExternalSireToggleProps {
  form: UseFormReturn<PlannedLitterFormValues>;
}

const ExternalSireToggle: React.FC<ExternalSireToggleProps> = ({ form }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <FormField
      control={form.control}
      name="externalMale"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white border-greige-300">
          <div className="space-y-0.5">
            <FormLabel>{t('forms.plannedLitter.externalSireToggle')}</FormLabel>
            <FormDescription>
              {t('forms.plannedLitter.externalSireDescription')}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ExternalSireToggle;
