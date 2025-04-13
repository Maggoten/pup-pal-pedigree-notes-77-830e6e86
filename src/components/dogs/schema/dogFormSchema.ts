
import { z } from "zod";

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
