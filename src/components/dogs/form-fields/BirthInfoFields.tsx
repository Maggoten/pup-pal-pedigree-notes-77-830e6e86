
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
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal bg-white h-10",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    // Display date without timezone concerns
                    typeof field.value === 'string' 
                      ? format(parseISODate(field.value) || new Date(), "PPP")
                      : format(field.value, "PPP")
                  ) : (
                    <span>{t('form.fields.dateOfBirth.placeholder')}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
                  } else {
                    field.onChange(null);
                  }
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1990-01-01")
                }
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <FormDescription className="text-xs">
            {t('form.fields.dateOfBirth.description')}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BirthInfoFields;
