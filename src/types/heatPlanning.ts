export interface HeatPrediction {
  id: string; // unique ID för varje prediction
  dogId: string;
  dogName: string;
  dogImageUrl?: string;
  dogBirthdate: string;
  date: Date;
  year: number;
  month: number;
  status: 'confirmed' | 'planned' | 'predicted' | 'overdue';
  interval: number; // dagar sedan senaste löp
  ageAtHeat: number; // ålder i år (decimal)
  hasPlannedLitter: boolean;
  plannedLitterId?: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface FertileDog {
  id: string;
  name: string;
  imageUrl?: string;
  birthdate: string;
  age: number;
  needsWarning: boolean; // true om 8-9 år
}

export const YEARS_TO_DISPLAY = 3;
export const MAX_BREEDING_AGE = 9;
export const WARNING_AGE = 8;
