
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dog } from '@/context/DogsContext';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';

interface DamSelectorProps {
  form: UseFormReturn<PlannedLitterFormValues>;
  females: Dog[];
}

const DamSelector: React.FC<DamSelectorProps> = ({ form, females }) => {
  return (
    <FormField
      control={form.control}
      name="femaleId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dam (Female)</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              // The expected heat date will be updated by the useEffect in PlannedLitterForm
            }} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="bg-white border-greige-300">
                <SelectValue placeholder="Select female dog" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              {females.map(dog => (
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

export default DamSelector;
