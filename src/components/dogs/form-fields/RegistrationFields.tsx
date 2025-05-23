
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';

interface RegistrationFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const RegistrationFields: React.FC<RegistrationFieldsProps> = ({ form, disabled }) => {
  return (
    <FormField
      control={form.control}
      name="registrationNumber"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Registration Number</FormLabel>
          <FormControl>
            <Input 
              placeholder="AKC123456" 
              {...field} 
              disabled={disabled} 
              className="h-10"
            />
          </FormControl>
          <FormDescription className="text-xs">
            Optional registration or license number
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RegistrationFields;
