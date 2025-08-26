
import React from 'react';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';

interface BirthInfoFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const BirthInfoFields: React.FC<BirthInfoFieldsProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        {t('form.sections.birthInfo')}
      </h3>
      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t('form.fields.dateOfBirth.label')}</FormLabel>
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
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01") || !!disabled}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              {t('form.fields.dateOfBirth.description')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BirthInfoFields;
