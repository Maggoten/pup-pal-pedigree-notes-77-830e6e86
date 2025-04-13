
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DogFormValues } from './schema/dogFormSchema';
import BreedDropdown from './breed-selector/BreedDropdown';
import TextInputField from './fields/TextInputField';
import DatePickerField from './fields/DatePickerField';
import GenderSelectField from './fields/GenderSelectField';
import TextareaField from './fields/TextareaField';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

interface DogFormFieldsProps {
  form: UseFormReturn<DogFormValues>;
}

const DogFormFields: React.FC<DogFormFieldsProps> = ({ form }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextInputField 
        form={form}
        name="name"
        label="Name"
        placeholder="Bella"
        required
      />
      
      <FormField
        control={form.control}
        name="breed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Breed*</FormLabel>
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
      
      <GenderSelectField form={form} />
      
      <DatePickerField 
        form={form}
        name="dateOfBirth"
        label="Date of Birth"
        required
      />
      
      <TextInputField 
        form={form}
        name="color"
        label="Color"
        placeholder="Golden"
        required
      />
      
      <TextInputField 
        form={form}
        name="registrationNumber"
        label="Registration Number"
        placeholder="AKC123456"
        description="Optional registration or license number"
      />
      
      <DatePickerField 
        form={form}
        name="dewormingDate"
        label="Last Deworming Date"
        description="Optional"
      />
      
      <DatePickerField 
        form={form}
        name="vaccinationDate"
        label="Last Vaccination Date"
        description="Optional"
      />
      
      <TextareaField 
        form={form}
        name="notes"
        label="Notes"
        placeholder="Any additional information..."
        description="Health concerns, temperament, or special care instructions"
      />
    </div>
  );
};

export default DogFormFields;
