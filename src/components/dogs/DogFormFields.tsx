
import React from 'react';
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import BasicInfoFields from './form-fields/BasicInfoFields';
import RegistrationFields from './form-fields/RegistrationFields';
import HealthFields from './form-fields/HealthFields';
import NotesField from './form-fields/NotesField';

export const dogFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  color: z.string().min(1, "Color is required"),
  registrationNumber: z.string().optional(),
  dewormingDate: z.date().optional(),
  vaccinationDate: z.date().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
  heatHistory: z.array(
    z.object({
      date: z.date()
    })
  ).optional(),
  heatInterval: z.number().positive().optional(),
});

export type DogFormValues = z.infer<typeof dogFormSchema>;

interface DogFormFieldsProps {
  form: UseFormReturn<DogFormValues>;
}

const DogFormFields: React.FC<DogFormFieldsProps> = ({ form }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BasicInfoFields form={form} />
      <RegistrationFields form={form} />
      <HealthFields form={form} />
      <NotesField form={form} />
    </div>
  );
};

export default DogFormFields;
