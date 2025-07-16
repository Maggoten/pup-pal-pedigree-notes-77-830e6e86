
import { Dog, BreedingHistory, Heat } from '@/types/dogs';
import { Database } from '@/integrations/supabase/types';
import { dateToISOString } from './dateUtils';

// Define a type for dogs in the database format
export type DbDog = Database['public']['Tables']['dogs']['Insert'];

// Add utility function for date handling
const safeISODateString = (dateValue: any): string => {
  if (!dateValue) return '';
  
  try {
    // Handle string dates
    if (typeof dateValue === 'string') {
      return dateValue.split('T')[0]; // Just get YYYY-MM-DD part
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateToISOString(dateValue);
    }
    
    // Handle timestamps
    if (typeof dateValue === 'number') {
      return dateToISOString(new Date(dateValue));
    }
    
    // Default fallback
    return '';
  } catch (err) {
    console.error('[Dogs Debug] Date conversion error:', err, 'Original value:', dateValue);
    return '';
  }
};

// Log device detection
const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Enriches a dog record from Supabase with UI-specific fields and defaults
 * @param dog - The raw dog data from Supabase
 * @returns A fully-formed Dog object with all UI fields
 */
export const enrichDog = (dog: any): Dog => {
  const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
  
  try {
    // Create default breeding history structure if missing
    const defaultBreedingHistory: BreedingHistory = {
      breedings: [],
      litters: [],
      matings: [] // Include matings for compatibility with ReminderService
    };

    // If heatHistory is present, ensure it has the correct structure
    let processedHeatHistory: Heat[] = [];
    
    if (dog.heatHistory) {
      console.log(`[Dogs Debug] Processing heat history for dog "${dog.name}" on ${deviceType}`);
      console.log(`[Dogs Debug] Heat history type: ${typeof dog.heatHistory}`);
      
      if (typeof dog.heatHistory === 'string') {
        // Sometimes it might come as a string that needs parsing
        try {
          const parsed = JSON.parse(dog.heatHistory);
          console.log(`[Dogs Debug] Parsed heat history from string, entries: ${Array.isArray(parsed) ? parsed.length : 'not an array'}`);
          
          if (Array.isArray(parsed)) {
            dog.heatHistory = parsed;
          } else {
            console.error(`[Dogs Debug] Parsed heat history is not an array:`, parsed);
            dog.heatHistory = [];
          }
        } catch (error) {
          console.error(`[Dogs Debug] Failed to parse heat history string:`, error);
          dog.heatHistory = [];
        }
      }
      
      // Now process the array (or empty array if parsing failed)
      if (Array.isArray(dog.heatHistory)) {
        processedHeatHistory = dog.heatHistory.map((heat: any, index: number) => {
          if (!heat) {
            console.error(`[Dogs Debug] Invalid heat entry at index ${index}:`, heat);
            return { date: '' };
          }
          
          try {
            return {
              // Ensure date is stored as YYYY-MM-DD without timezone impact
              date: typeof heat.date === 'string' ? heat.date.split('T')[0] : 
                    Object.prototype.toString.call(heat.date) === '[object Date]' ? dateToISOString(heat.date) : ''
            };
          } catch (error) {
            console.error(`[Dogs Debug] Error processing heat entry at index ${index}:`, error, heat);
            return { date: '' };
          }
        });
        
        console.log(`[Dogs Debug] Processed heat history entries: ${processedHeatHistory.length}`);
      } else {
        console.error(`[Dogs Debug] Heat history is not an array after processing:`, dog.heatHistory);
      }
    } else {
      console.log(`[Dogs Debug] Dog "${dog.name}" has no heat history`);
    }

    // Create the enriched dog with proper safeguards for all fields
    const enrichedDog: Dog = {
      ...dog,
      // Alias fields for UI
      dateOfBirth: dog.birthdate ? dog.birthdate.split('T')[0] : '',
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
    
    console.log(`[Dogs Debug] Successfully enriched dog "${dog.name}" on ${deviceType}`);
    return enrichedDog;
  } catch (error) {
    console.error(`[Dogs Debug] Failed to enrich dog:`, error, dog);
    // Create a minimal valid dog object to prevent app crashes
    return {
      ...dog,
      id: dog.id || 'error-id',
      owner_id: dog.owner_id || '',
      name: dog.name || 'Unknown Dog',
      breed: dog.breed || 'Unknown',
      gender: dog.gender || 'female',
      dateOfBirth: '',
      image: '',
      registrationNumber: '',
      heatHistory: [],
      breedingHistory: {
        breedings: [],
        litters: [],
        matings: []
      }
    };
  }
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
  console.log('[Dogs Debug] Starting DB sanitization for dog object:', dog);
  
  // Create a new object to avoid mutation
  const dbDog: Partial<DbDog> = {};
  
  // Explicitly map UI field names to DB field names
  if ('dateOfBirth' in dog && dog.dateOfBirth !== undefined) {
    // Ensure birthdate is stored as YYYY-MM-DD without timezone impact
    dbDog.birthdate = typeof dog.dateOfBirth === 'string' 
      ? dog.dateOfBirth.split('T')[0]
      : Object.prototype.toString.call(dog.dateOfBirth) === '[object Date]'
        ? dateToISOString(dog.dateOfBirth as unknown as Date)
        : undefined;
    
    console.log('[Dogs Debug] Mapped dateOfBirth to birthdate:', dbDog.birthdate);
  }
  
  if ('registrationNumber' in dog && dog.registrationNumber !== undefined) {
    dbDog.registration_number = dog.registrationNumber;
    console.log('[Dogs Debug] Mapped registrationNumber to registration_number:', dog.registrationNumber);
  }
  
  if ('image' in dog && dog.image !== undefined) {
    dbDog.image_url = dog.image;
    console.log('[Dogs Debug] Mapped image to image_url:', dog.image);
  }
  
  // Handle sterilization date
  if ('sterilizationDate' in dog && dog.sterilizationDate !== undefined) {
    dbDog.sterilization_date = typeof dog.sterilizationDate === 'string' 
      ? dog.sterilizationDate.split('T')[0]
      : Object.prototype.toString.call(dog.sterilizationDate) === '[object Date]'
        ? dateToISOString(dog.sterilizationDate as unknown as Date)
        : (dog.sterilizationDate as string);
    console.log('[Dogs Debug] Mapped sterilizationDate to sterilization_date:', dbDog.sterilization_date);
  }
  
  // Process heat history - CRITICAL: Handle both Date objects and Heat objects
  if ('heatHistory' in dog && dog.heatHistory !== undefined) {
    console.log('[Dogs Debug] Processing heat history for DB save:', dog.heatHistory);
    
    // Ensure we have an array to work with
    const heatArray = Array.isArray(dog.heatHistory) ? dog.heatHistory : [];
    
    const processedHeatHistory = heatArray.map((heat: any, index: number) => {
      console.log(`[Dogs Debug] Processing heat entry ${index}:`, heat, 'Type:', typeof heat);
      
      // Handle the case where heat is a Date object directly (from form)
      if (heat instanceof Date) {
        const processedDate = dateToISOString(heat);
        console.log(`[Dogs Debug] Converted Date object to string: "${processedDate}"`);
        return { date: processedDate };
      }
      
      // Handle the case where heat has a date property that's a Date object
      if (heat && typeof heat === 'object' && heat.date instanceof Date) {
        const processedDate = dateToISOString(heat.date);
        console.log(`[Dogs Debug] Converted heat.date Date object to string: "${processedDate}"`);
        return { date: processedDate };
      }
      
      // Handle the case where heat is already in the correct format
      if (heat && typeof heat === 'object' && typeof heat.date === 'string') {
        const processedDate = heat.date.split('T')[0]; // Extract YYYY-MM-DD
        console.log(`[Dogs Debug] Using existing string date: "${processedDate}"`);
        return { date: processedDate };
      }
      
      // Validate heat entry structure
      if (!heat || typeof heat !== 'object') {
        console.warn(`[Dogs Debug] Invalid heat entry at index ${index}, skipping:`, heat);
        return null; // Skip invalid entries instead of creating empty ones
      }
      
      // Process other date field formats
      let processedDate = '';
      if (heat.date) {
        if (typeof heat.date === 'string') {
          processedDate = heat.date.split('T')[0]; // Extract YYYY-MM-DD
        } else {
          console.warn(`[Dogs Debug] Unexpected date format at index ${index}:`, heat.date);
        }
      }
      
      if (processedDate) {
        console.log(`[Dogs Debug] Processed heat date ${index}: "${processedDate}"`);
        return { date: processedDate };
      }
      
      return null; // Skip entries without valid dates
    }).filter(Boolean); // Remove null entries
    
    // Always include heatHistory in the update
    dbDog.heatHistory = processedHeatHistory;
    console.log('[Dogs Debug] Final processed heatHistory for DB (filtered):', processedHeatHistory);
  }
  
  // Process optional dates to ensure YYYY-MM-DD format
  if ('dewormingDate' in dog && dog.dewormingDate) {
    if (typeof dog.dewormingDate === 'string') {
      dbDog.dewormingDate = dog.dewormingDate.split('T')[0];
    } else if (Object.prototype.toString.call(dog.dewormingDate) === '[object Date]') {
      dbDog.dewormingDate = dateToISOString(dog.dewormingDate as unknown as Date);
    } else {
      dbDog.dewormingDate = undefined;
    }
  }
  
  if ('vaccinationDate' in dog && dog.vaccinationDate) {
    if (typeof dog.vaccinationDate === 'string') {
      dbDog.vaccinationDate = dog.vaccinationDate.split('T')[0];
    } else if (Object.prototype.toString.call(dog.vaccinationDate) === '[object Date]') {
      dbDog.vaccinationDate = dateToISOString(dog.vaccinationDate as unknown as Date);
    } else {
      dbDog.vaccinationDate = undefined;
    }
  }
  
  // Copy direct fields that have the same name
  const directFields: (keyof Dog & keyof DbDog)[] = [
    'id', 'owner_id', 'name', 'breed', 'gender', 
    'color', 'chip_number', 'notes', 'created_at', 'updated_at',
    'breedingHistory', 'heatInterval'
  ];
  
  directFields.forEach(field => {
    if (field in dog && dog[field] !== undefined) {
      (dbDog[field] as any) = dog[field];
      console.log(`[Dogs Debug] Copied field ${field}:`, dog[field]);
    }
  });
  
  console.log('[Dogs Debug] Final sanitized dog object for DB:', dbDog);
  return dbDog;
};

/**
 * Convert form heat history (with Date objects) to database heat history (with string dates)
 */
export const convertFormHeatHistoryToDbFormat = (formHeatHistory: { date: Date }[]): Heat[] => {
  return formHeatHistory.map(heat => ({
    date: dateToISOString(heat.date) || ''
  }));
};

/**
 * Convert database heat history (with string dates) to form heat history (with Date objects)
 */
export const convertDbHeatHistoryToFormFormat = (dbHeatHistory: Heat[]): { date: Date }[] => {
  return dbHeatHistory.map(heat => {
    // Create date at noon to avoid timezone issues
    const date = new Date(heat.date);
    date.setHours(12, 0, 0, 0);
    return { date };
  });
};
