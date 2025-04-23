
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface HeatIntervalFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const HeatIntervalField: React.FC<HeatIntervalFieldProps> = ({ form, disabled }) => {
  return (
    <FormField
      control={form.control}
      name="heatInterval"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Heat Interval (days)</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="180"
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
