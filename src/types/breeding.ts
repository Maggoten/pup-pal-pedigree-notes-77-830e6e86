
export interface PlannedLitter {
  id: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  expectedHeatDate: string;
  matingDates?: string[];
  notes: string;
  externalMale?: boolean;
  externalMaleBreed?: string;
}
