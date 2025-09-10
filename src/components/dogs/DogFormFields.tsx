
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";
import { Dog } from '@/context/DogsContext';
import { Gender } from '@/types/dogs';
import BasicInfoFields from './form-fields/BasicInfoFields';
import HealthFields from './form-fields/HealthFields';
import NotesField from './form-fields/NotesField';
import { useTranslation } from 'react-i18next';

export const dogFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  dateOfBirth: z.instanceof(Date, { message: "Date of birth is required" }),
  gender: z.enum(["male", "female"] as const),
  color: z.string().optional(),
  registrationNumber: z.string().optional(),
  registeredName: z.string().optional(),
  dewormingDate: z.instanceof(Date).optional().nullable(),
  vaccinationDate: z.instanceof(Date).optional().nullable(),
  sterilizationDate: z.instanceof(Date).optional().nullable(),
  notes: z.string().optional(),
  image: z.string().optional(),
  heatHistory: z.array(
    z.object({
      date: z.instanceof(Date)
    })
  ).optional(),
});

export type DogFormValues = z.infer<typeof dogFormSchema>;

interface DogFormFieldsProps {
  form: UseFormReturn<DogFormValues>;
  disabled?: boolean;
}

const DogFormFields: React.FC<DogFormFieldsProps> = ({ form, disabled }) => {
  return (
    <div className="space-y-8">
      {/* Full width basic information */}
      <BasicInfoFields form={form} disabled={disabled} />
      
      {/* Health information */}
      <HealthFields form={form} disabled={disabled} />
    </div>
  );
};

export default DogFormFields;
