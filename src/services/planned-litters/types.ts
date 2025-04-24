
import { z } from 'zod';

export const plannedLitterFormSchema = z.object({
  femaleId: z.string().min(1, "Female dog is required"),
  femaleName: z.string().min(1, "Female name is required"),
  maleId: z.string().optional(),
  maleName: z.string().optional(),
  externalMale: z.boolean().default(false),
  externalMaleName: z.string().optional(),
  externalMaleBreed: z.string().optional(),
  externalMaleRegistration: z.string().optional(),
  expectedHeatDate: z.date(),
  notes: z.string().optional()
});

export type PlannedLitterFormValues = z.infer<typeof plannedLitterFormSchema>;

