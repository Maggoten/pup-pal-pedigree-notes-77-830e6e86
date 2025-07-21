
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface HeatIntervalFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const HeatIntervalField: React.FC<HeatIntervalFieldProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <FormField
      control={form.control}
      name="heatInterval"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('form.breeding.heatInterval.label')}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t('form.breeding.heatInterval.placeholder')}
              {...field}
              value={field.value || ''}
              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HeatIntervalField;
