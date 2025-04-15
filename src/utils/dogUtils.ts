
import { Dog, BreedingHistory } from '@/types/dogs';
import { Database } from '@/integrations/supabase/types';

// Define a type for dogs in the database format
export type DbDog = Database['public']['Tables']['dogs']['Insert'];

/**
 * Enriches a dog record from Supabase with UI-specific fields and defaults
 */
export const enrichDog = (dog: any): Dog => {
  // Create default breeding history structure if missing
  const defaultBreedingHistory: BreedingHistory = {
    breedings: [],
    litters: [],
    matings: [] // Include matings for compatibility with ReminderService
  };

  return {
    ...dog,
    // Alias fields for UI
    dateOfBirth: dog.birthdate || '',
    image: dog.image_url || '',
    registrationNumber: dog.registration_number || '',

    // Fallbacks for frontend-only fields
    heatHistory: dog.heatHistory || [],
    breedingHistory: dog.breedingHistory || defaultBreedingHistory,
    heatInterval: dog.heatInterval || undefined,

    // Normalize gender just in case
    gender: dog.gender === 'male' || dog.gender === 'female'
      ? dog.gender
      : (dog.gender?.toLowerCase() === 'male' ? 'male' : 'female')
  };
};

/**
 * Sanitizes a dog object for database insertion/update by:
 * 1. Mapping UI field names to database field names
 * 2. Removing fields that don't exist in the database schema
 */
export const sanitizeDogForDb = (dog: Partial<Dog>): Partial<DbDog> => {
  // Create a new object with only the fields that exist in the database
  const dbDog: Partial<DbDog> = {};
  
  // Copy allowed fields directly
  const allowedFields = [
    'id', 'owner_id', 'name', 'breed', 'gender', 
    'color', 'chip_number', 'notes', 'created_at', 'updated_at'
  ];
  
  allowedFields.forEach(field => {
    if (field in dog) {
      dbDog[field as keyof DbDog] = dog[field as keyof Dog] as any;
    }
  });
  
  // Map UI field names to database field names
  if ('dateOfBirth' in dog) {
    dbDog.birthdate = dog.dateOfBirth;
  }
  
  if ('registrationNumber' in dog) {
    dbDog.registration_number = dog.registrationNumber;
  }
  
  if ('image' in dog) {
    dbDog.image_url = dog.image;
  }
  
  // JSON and date fields that exist in the database
  if ('heatHistory' in dog) {
    dbDog.heatHistory = dog.heatHistory;
  }
  
  if ('breedingHistory' in dog) {
    dbDog.breedingHistory = dog.breedingHistory;
  }
  
  if ('heatInterval' in dog) {
    dbDog.heatInterval = dog.heatInterval;
  }
  
  if ('dewormingDate' in dog) {
    dbDog.dewormingDate = dog.dewormingDate;
  }
  
  if ('vaccinationDate' in dog) {
    dbDog.vaccinationDate = dog.vaccinationDate;
  }
  
  return dbDog;
};
