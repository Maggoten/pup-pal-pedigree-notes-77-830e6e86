
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
    <div className="space-y-3">
      <Label className="text-sm font-medium block">{t('form.breeding.sterilized.label')}</Label>
      
      {!sterilizationDate && (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddDate}
            disabled={disabled}
            className="w-fit"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('form.breeding.sterilized.addDate')}
          </Button>
        </div>
      )}
      
      {sterilizationDate && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="pl-3 text-left font-normal bg-white border-input shadow-sm flex-1"
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {typeof sterilizationDate === 'string'
                  ? format(parseISODate(sterilizationDate) || new Date(), "PPP")
                  : format(sterilizationDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={typeof sterilizationDate === 'string'
                  ? parseISODate(sterilizationDate) || undefined
                  : sterilizationDate}
                onSelect={handleDateSelect}
                disabled={date => date > new Date() || !!disabled}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveDate}
            disabled={disabled}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <FormField
        control={form.control}
        name="sterilizationDate"
        render={() => (
          <FormItem className="hidden">
            <FormControl>
              <input type="hidden" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SterilizationDateField;
