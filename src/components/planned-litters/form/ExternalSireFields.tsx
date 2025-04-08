
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import BreedDropdown from '@/components/dogs/BreedDropdown';
import { UseFormReturn } from 'react-hook-form';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';

interface ExternalSireFieldsProps {
  form: UseFormReturn<PlannedLitterFormValues>;
}

const ExternalSireFields: React.FC<ExternalSireFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="externalMaleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>External Sire Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter dog name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="externalMaleRegistration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Registration Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter registration number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="externalMaleBreed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>External Sire Breed</FormLabel>
            <FormControl>
              <BreedDropdown 
                value={field.value} 
                onChange={field.onChange} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ExternalSireFields;
