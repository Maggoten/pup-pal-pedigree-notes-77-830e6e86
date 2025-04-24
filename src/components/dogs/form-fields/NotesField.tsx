
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from '../DogFormFields';

interface NotesFieldProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const NotesField: React.FC<NotesFieldProps> = ({ form, disabled }) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Any additional information..."
              className="resize-none"
              {...field}
              disabled={disabled}
            />
          </FormControl>
          <FormDescription>
            Health concerns, temperament, or special care instructions
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
