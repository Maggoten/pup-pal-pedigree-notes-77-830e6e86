
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dog } from '@/context/DogsContext';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { useTranslation } from 'react-i18next';

interface InternalSireSelectorProps {
  form: UseFormReturn<PlannedLitterFormValues>;
  males: Dog[];
}

const InternalSireSelector: React.FC<InternalSireSelectorProps> = ({ form, males }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <FormField
      control={form.control}
      name="maleId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('forms.plannedLitter.sireLabel')}</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="bg-white border-greige-300">
                <SelectValue placeholder={t('forms.plannedLitter.sirePlaceholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              {males.map(dog => (
                <SelectItem key={dog.id} value={dog.id}>
                  {dog.name} ({dog.breed})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InternalSireSelector;
