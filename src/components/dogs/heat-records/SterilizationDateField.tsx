
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';

interface SterilizationDateFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const SterilizationDateField: React.FC<SterilizationDateFieldProps> = ({
  form,
  disabled
}) => {
  const sterilizationDate = form.watch('sterilizationDate');
  const { t } = useTranslation('dogs');

  const handleAddDate = () => {
    const newDate = new Date();
    newDate.setHours(12, 0, 0, 0);
    form.setValue('sterilizationDate', newDate, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const handleRemoveDate = () => {
    form.setValue('sterilizationDate', undefined, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(12, 0, 0, 0);
      form.setValue('sterilizationDate', newDate, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  };

  return (
    <FormField
      control={form.control}
      name="sterilizationDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{t('form.health.sterilization.label')}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>{t('form.fields.pickADate')}</span>}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={date => date > new Date() || !!disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SterilizationDateField;
