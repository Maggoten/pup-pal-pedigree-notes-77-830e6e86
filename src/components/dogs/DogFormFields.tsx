
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import { Dog } from '@/context/DogsContext';
import { Gender } from '@/types/dogs';
import BasicInfoFields from './form-fields/BasicInfoFields';
import RegistrationFields from './form-fields/RegistrationFields';
import HealthFields from './form-fields/HealthFields';
import NotesField from './form-fields/NotesField';
import BirthInfoFields from './form-fields/BirthInfoFields';

export const dogFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  dateOfBirth: z.instanceof(Date, { message: "Date of birth is required" }),
  birthYear: z.number().int().min(1990).max(new Date().getFullYear()),
  gender: z.enum(["male", "female"] as const),
  color: z.string().optional(),
  registrationNumber: z.string().optional(),
  dewormingDate: z.instanceof(Date).optional().nullable(),
  vaccinationDate: z.instanceof(Date).optional().nullable(),
  notes: z.string().optional(),
  image: z.string().optional(),
  heatHistory: z.array(
    z.object({
      date: z.instanceof(Date)
    })
  ).optional(),
  heatInterval: z.number().positive().optional(),
});

export type DogFormValues = z.infer<typeof dogFormSchema>;

interface DogFormFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean; // Added disabled prop
}

const DogFormFields: React.FC<DogFormFieldsProps> = ({ form, disabled }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BasicInfoFields form={form} disabled={disabled} />
      <BirthInfoFields form={form} disabled={disabled} />
      <RegistrationFields form={form} disabled={disabled} />
      <HealthFields form={form} disabled={disabled} />
      <NotesField form={form} disabled={disabled} />
    </div>
  );
};

export default DogFormFields;
