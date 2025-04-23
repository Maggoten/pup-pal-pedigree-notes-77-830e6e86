
import { Dog, BreedingHistory, Heat } from '@/types/dogs';
import { Database } from '@/integrations/supabase/types';

// Define a type for dogs in the database format
export type DbDog = Database['public']['Tables']['dogs']['Insert'];

/**
 * Enriches a dog record from Supabase with UI-specific fields and defaults
 * @param dog - The raw dog data from Supabase
 * @returns A fully-formed Dog object with all UI fields
 */
export const enrichDog = (dog: any): Dog => {
  // Create default breeding history structure if missing
  const defaultBreedingHistory: BreedingHistory = {
    breedings: [],
    litters: [],
    matings: [] // Include matings for compatibility with ReminderService
  };

  // If heatHistory is present, ensure it has the correct structure
  let processedHeatHistory: Heat[] = [];
  
  if (dog.heatHistory && Array.isArray(dog.heatHistory)) {
    processedHeatHistory = dog.heatHistory.map((heat: any) => ({
      date: typeof heat.date === 'string' ? heat.date : 
            heat.date instanceof Date ? heat.date.toISOString().split('T')[0] : ''
    }));
  }

  return {
    ...dog,
    // Alias fields for UI
    dateOfBirth: dog.birthdate || '',
    image: dog.image_url || '',
    registrationNumber: dog.registration_number || '',

    // Processed fields
    heatHistory: processedHeatHistory,
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
 * 
 * @param dog - The Dog object from the UI
 * @returns A database-compatible dog object ready for Supabase
 */
export const sanitizeDogForDb = (dog: Partial<Dog>): Partial<DbDog> => {
  console.log('Original dog object for DB sanitization:', dog);
  
  // Create a new object to avoid mutation
  const dbDog: Partial<DbDog> = {};
  
  // Explicitly map UI field names to DB field names
  if ('dateOfBirth' in dog && dog.dateOfBirth !== undefined) {
    dbDog.birthdate = dog.dateOfBirth;
    console.log('Mapped dateOfBirth to birthdate:', dog.dateOfBirth);
  }
  
  if ('registrationNumber' in dog && dog.registrationNumber !== undefined) {
    dbDog.registration_number = dog.registrationNumber;
    console.log('Mapped registrationNumber to registration_number:', dog.registrationNumber);
  }
  
  if ('image' in dog && dog.image !== undefined) {
    dbDog.image_url = dog.image;
    console.log('Mapped image to image_url:', dog.image);
  }
  
  // Process heat history if present, ensuring dates are strings
  if ('heatHistory' in dog && dog.heatHistory) {
    const processedHeatHistory = dog.heatHistory.map((heat: Heat) => ({
      date: typeof heat.date === 'string' ? heat.date : 
            heat.date instanceof Date ? heat.date.toISOString().split('T')[0] : ''
    }));
    
    dbDog.heatHistory = processedHeatHistory;
    console.log('Processed heatHistory for DB:', processedHeatHistory);
  }
  
  // Copy direct fields that have the same name
  const directFields: (keyof Dog & keyof DbDog)[] = [
    'id', 'owner_id', 'name', 'breed', 'gender', 
    'color', 'chip_number', 'notes', 'created_at', 'updated_at',
    'breedingHistory', 'heatInterval', 'dewormingDate', 'vaccinationDate'
  ];
  
  directFields.forEach(field => {
    if (field in dog && dog[field] !== undefined) {
      (dbDog[field] as any) = dog[field];
      console.log(`Copied field ${field}:`, dog[field]);
    }
  });
  
  console.log('Sanitized dog object for DB:', dbDog);
  return dbDog;
};

/**
 * Convert form heat history (with Date objects) to database heat history (with string dates)
 */
export const convertFormHeatHistoryToDbFormat = (formHeatHistory: { date: Date }[]): Heat[] => {
  return formHeatHistory.map(heat => ({
    date: heat.date.toISOString().split('T')[0]
  }));
};

/**
 * Convert database heat history (with string dates) to form heat history (with Date objects)
 */
export const convertDbHeatHistoryToFormFormat = (dbHeatHistory: Heat[]): { date: Date }[] => {
  return dbHeatHistory.map(heat => ({
    date: new Date(heat.date)
  }));
};
