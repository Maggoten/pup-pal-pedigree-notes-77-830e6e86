
import { PlannedLitter } from '@/types/breeding';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';

// Define the form schema here for reuse
export const plannedLitterFormSchema = z.object({
  maleId: z.string().optional(),
  femaleId: z.string({ required_error: "Dam is required" }),
  expectedHeatDate: z.date({
    required_error: "Expected heat date is required",
  }),
  notes: z.string().optional(),
  externalMale: z.boolean().default(false),
  externalMaleName: z.string().optional(),
  externalMaleBreed: z.string().optional(),
}).refine(data => {
  if (data.externalMale) {
    return !!data.externalMaleName;
  }
  return !!data.maleId;
}, {
  message: "Please select a male dog or provide external dog details",
  path: ["maleId"],
});

export type PlannedLitterFormValues = z.infer<typeof plannedLitterFormSchema>;

// Service class to handle all planned litter operations
class PlannedLitterService {
  private readonly STORAGE_KEY = 'plannedLitters';

  /**
   * Load planned litters from localStorage
   */
  loadPlannedLitters(): PlannedLitter[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      {
        id: '1',
        maleId: '3',
        femaleId: '2',
        maleName: 'Rocky',
        femaleName: 'Bella',
        expectedHeatDate: '2025-05-15',
        notes: 'First planned breeding, watching for genetic diversity'
      }
    ];
  }

  /**
   * Save planned litters to localStorage
   */
  savePlannedLitters(litters: PlannedLitter[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(litters));
  }

  /**
   * Create a new planned litter
   */
  createPlannedLitter(formValues: PlannedLitterFormValues, dogs: any[]): PlannedLitter {
    let maleName: string;
    let maleId: string;
    
    if (formValues.externalMale) {
      maleName = formValues.externalMaleName || "Unknown Sire";
      maleId = `external-${Date.now()}`;
    } else {
      const male = dogs.find(dog => dog.id === formValues.maleId);
      if (!male) {
        throw new Error("Selected male dog not found.");
      }
      maleName = male.name;
      maleId = male.id;
    }
    
    const female = dogs.find(dog => dog.id === formValues.femaleId);
    if (!female) {
      throw new Error("Selected female dog not found.");
    }
    
    return {
      id: Date.now().toString(),
      maleId: maleId,
      femaleId: formValues.femaleId,
      maleName: maleName,
      femaleName: female.name,
      expectedHeatDate: format(formValues.expectedHeatDate, 'yyyy-MM-dd'),
      notes: formValues.notes || '',
      externalMale: formValues.externalMale,
      externalMaleBreed: formValues.externalMaleBreed,
    };
  }

  /**
   * Add a mating date to an existing litter
   */
  addMatingDate(litters: PlannedLitter[], litterId: string, date: Date): PlannedLitter[] {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    return litters.map(litter => 
      litter.id === litterId 
        ? { 
            ...litter, 
            matingDates: [...(litter.matingDates || []), formattedDate] 
          } 
        : litter
    );
  }

  /**
   * Delete a planned litter
   */
  deletePlannedLitter(litters: PlannedLitter[], litterId: string): PlannedLitter[] {
    return litters.filter(litter => litter.id !== litterId);
  }
}

// Export a singleton instance
export const plannedLitterService = new PlannedLitterService();
