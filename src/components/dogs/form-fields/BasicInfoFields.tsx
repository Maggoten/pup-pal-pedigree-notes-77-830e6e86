
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';
import BreedDropdown from '../breed-selector/BreedDropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

interface BasicInfoFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          {t('form.sections.basicInfo')}
        </h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.name.label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('form.fields.name.placeholder')} {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="registeredName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.registeredName.label')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('form.fields.registeredName.placeholder')} 
                    {...field} 
                    disabled={disabled} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.breed.label')}</FormLabel>
                <FormControl>
                  <BreedDropdown
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Physical Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          {t('form.sections.physicalDetails')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.gender.label')}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.fields.gender.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t('form.fields.gender.male')}</SelectItem>
                    <SelectItem value="female">{t('form.fields.gender.female')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.color.label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('form.fields.color.placeholder')} {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Date of Birth and Registration Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          
          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.fields.registrationNumber.label')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('form.fields.registrationNumber.placeholder')} 
                    {...field} 
                    disabled={disabled} 
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  {t('form.fields.registrationNumber.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoFields;
