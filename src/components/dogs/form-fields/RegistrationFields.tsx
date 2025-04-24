
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
        <FormItem>
          <FormLabel>Registration Number</FormLabel>
          <FormControl>
            <Input placeholder="AKC123456" {...field} disabled={disabled} />
          </FormControl>
          <FormDescription>
            Optional registration or license number
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RegistrationFields;
