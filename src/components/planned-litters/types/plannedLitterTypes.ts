
export interface PlannedLitterFormData {
  maleName: string;
  femaleName: string;
  expectedHeatDate: Date;
  notes?: string;
  maleId?: string;
  femaleId: string;
  externalMale: boolean;
  externalMaleName?: string;
  externalMaleBreed?: string;
  externalMaleRegistration?: string;
}
