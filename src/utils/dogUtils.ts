
import { Dog, BreedingHistory } from '@/types/dogs';

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
