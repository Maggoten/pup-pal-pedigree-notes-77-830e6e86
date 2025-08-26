
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';

interface HealthFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const HealthFields: React.FC<HealthFieldsProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        {t('form.sections.healthRecords')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="dewormingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('form.health.deworming.label')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal bg-white border-input shadow-sm",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      {field.value ? (
                        typeof field.value === 'string'
                          ? format(parseISODate(field.value) || new Date(), "PPP")
                          : format(field.value, "PPP")
                      ) : (
                        <span>{t('form.fields.pickADate')}</span>
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
                        date.setHours(12, 0, 0, 0);
                        field.onChange(date);
                      } else {
                        field.onChange(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || !!disabled}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>{t('form.fields.optional')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="vaccinationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('form.health.vaccination.label')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal bg-white border-input shadow-sm",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      {field.value ? (
                        typeof field.value === 'string'
                          ? format(parseISODate(field.value) || new Date(), "PPP")
                          : format(field.value, "PPP")
                      ) : (
                        <span>{t('form.fields.pickADate')}</span>
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
                        date.setHours(12, 0, 0, 0);
                        field.onChange(date);
                      } else {
                        field.onChange(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || !!disabled}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>{t('form.fields.optional')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                        "pl-3 text-left font-normal bg-white border-input shadow-sm",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={disabled}
                    >
                      {field.value ? (
                        typeof field.value === 'string'
                          ? format(parseISODate(field.value) || new Date(), "PPP")
                          : format(field.value, "PPP")
                      ) : (
                        <span>{t('form.fields.pickADate')}</span>
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
                        date.setHours(12, 0, 0, 0);
                        field.onChange(date);
                      } else {
                        field.onChange(null);
                      }
                    }}
                    disabled={(date) => date > new Date() || !!disabled}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>{t('form.fields.optionalFemaleOnly')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default HealthFields;
