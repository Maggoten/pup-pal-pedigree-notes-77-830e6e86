import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';

interface HeatDatePickerProps {
  form: UseFormReturn<PlannedLitterFormValues>;
}

const HeatDatePicker: React.FC<HeatDatePickerProps> = ({ form }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <FormField
      control={form.control}
      name="expectedHeatDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{t('forms.plannedLitter.expectedHeatDate')}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal bg-white border-greige-300",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    typeof field.value === 'string'
                      ? format(parseISODate(field.value) || new Date(), "PPP") 
                      : format(field.value, "PPP")
                  ) : (
                    <span>{t('dialogs.litterDetails.selectDate')}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={typeof field.value === 'string'
                  ? parseISODate(field.value) || undefined
                  : field.value}
                onSelect={(date) => {
                  if (date) {
                    // Set time to noon to avoid timezone issues
                    date.setHours(12, 0, 0, 0);
                    field.onChange(date);
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto bg-white"
              />
            </PopoverContent>
          </Popover>
          <FormDescription className="text-xs text-muted-foreground">
            {t('forms.plannedLitter.expectedHeatDateDescription')}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HeatDatePicker;
