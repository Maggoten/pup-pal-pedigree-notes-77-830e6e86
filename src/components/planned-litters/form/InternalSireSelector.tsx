
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dog } from '@/context/DogsContext';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';

interface InternalSireSelectorProps {
  form: UseFormReturn<PlannedLitterFormValues>;
  males: Dog[];
}

const InternalSireSelector: React.FC<InternalSireSelectorProps> = ({ form, males }) => {
  return (
    <FormField
      control={form.control}
      name="maleId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sire (Male)</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select male dog" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
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
