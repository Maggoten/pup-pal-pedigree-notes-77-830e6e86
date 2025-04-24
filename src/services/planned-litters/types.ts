
import { z } from 'zod';

export const plannedLitterFormSchema = z.object({
  femaleId: z.string().min(1, "Female dog is required"),
  femaleName: z.string().optional(),
  maleId: z.string().optional(),
  maleName: z.string().optional(),
  externalMale: z.boolean().default(false),
  externalMaleName: z.string().optional().nullable(),
  externalMaleBreed: z.string().optional().nullable(),
  externalMaleRegistration: z.string().optional().nullable(),
  expectedHeatDate: z.date({
    required_error: "Expected heat date is required",
    invalid_type_error: "Invalid date format",
  }),
  notes: z.string().optional()
}).refine((data) => {
  if (data.externalMale) {
    return !!data.externalMaleName;
  }
  return !!data.maleId;
}, {
  message: "Please select a male dog or provide external male information",
  path: ["maleId"]
});

export type PlannedLitterFormValues = z.infer<typeof plannedLitterFormSchema>;
