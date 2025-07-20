
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
import { useTranslation } from 'react-i18next';

interface BasicInfoFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, disabled }) => {
  const { t } = useTranslation('dogs');
  
  return (
    <>
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
    </>
  );
};

export default BasicInfoFields;
